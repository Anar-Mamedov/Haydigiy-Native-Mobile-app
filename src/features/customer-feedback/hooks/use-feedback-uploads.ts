import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { prepareUploadPhoto } from '@/lib/prepare-upload-photo';
import { IMAGE_UPLOAD_TIMEOUT_MS, VIDEO_UPLOAD_TIMEOUT_MS, type FeedbackUploadFile } from '@/services/customer-feedback.service';
import { uuidv4 } from '@/utils/uuid';
import { useUploadFeedbackAttachmentMutation } from '../api/customer-feedback.mutations';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { FEEDBACK_MEDIA_LIMITS } from '../constants/feedback-media-limits';
import { toFeedbackApiError } from '../utils/feedback-api-error';
import { getVideoFileName, getVideoMimeType, type FeedbackMediaKind, type PickedMedia } from '../utils/feedback-files';
import { toUploadFailure } from '../utils/feedback-upload-errors';
import type { UploadedAttachment } from '../utils/feedback-payload';

export type FeedbackUploadStatus = 'preparing' | 'queued' | 'uploading' | 'done' | 'error';

export type FeedbackUploadRow = {
  id: string;
  fieldKey: string;
  kind: FeedbackMediaKind;
  name: string;
  previewUri: string;
  status: FeedbackUploadStatus;
  progress: number;
  error?: string;
  retryable?: boolean;
};

type InternalRow = FeedbackUploadRow & { source: PickedMedia; file?: FeedbackUploadFile; token?: string };

async function prepareFile(row: InternalRow): Promise<FeedbackUploadFile> {
  if (row.kind === 'image') return prepareUploadPhoto(row.source);
  const type = getVideoMimeType(row.source);
  return { uri: row.source.uri, name: getVideoFileName(row.source, type), type };
}

/**
 * Seçilen dosyaları hazırlar (görsel: JPEG 2048 px) ve SIRAYLA yükler (aynı anda en çok 2, §5.2).
 * Belirteçler yalnız bellekte durur; kaldırılan dosyanın belirteci unutulur, sunucu yetimi temizler.
 */
export function useFeedbackUploads(categoryKey: string | null, onFormOutdated: () => void) {
  const upload = useUploadFeedbackAttachmentMutation();
  const [rows, setRows] = useState<InternalRow[]>([]);
  const rowsRef = useRef<InternalRow[]>([]);
  const queueRef = useRef<string[]>([]);
  const activeRef = useRef(0);
  const controllersRef = useRef(new Map<string, AbortController>());

  const patch = useCallback((id: string, changes: Partial<InternalRow>) => {
    rowsRef.current = rowsRef.current.map((row) => (row.id === id ? { ...row, ...changes } : row));
    setRows(rowsRef.current);
  }, []);

  const run = useCallback(
    async (row: InternalRow) => {
      if (!categoryKey) return;
      const controller = new AbortController();
      controllersRef.current.set(row.id, controller);
      let file = row.file;
      try {
        patch(row.id, { status: 'preparing', error: undefined });
        file = file ?? (await prepareFile(row));
        patch(row.id, { status: 'uploading', file, progress: 0 });
        const result = await upload.mutateAsync({
          file,
          categoryKey,
          fieldKey: row.fieldKey,
          timeout: row.kind === 'video' ? VIDEO_UPLOAD_TIMEOUT_MS : IMAGE_UPLOAD_TIMEOUT_MS,
          signal: controller.signal,
          onProgress: (progress) => patch(row.id, { progress }),
        });
        patch(row.id, { status: 'done', progress: 100, token: result.uploadToken });
        AccessibilityInfo.announceForAccessibility(`${row.name} ${T.fileStatus.done}`);
      } catch (cause) {
        if (controller.signal.aborted) return;
        const apiError = toFeedbackApiError(cause);
        // Hazırlama (JPEG'e çevirme) başarısızsa aynı dosyayı yeniden denemek işe yaramaz.
        const failure = file ? toUploadFailure(apiError) : { message: T.fileFailed, retryable: false };
        if (apiError.kind === 'form_outdated') onFormOutdated();
        patch(row.id, { status: 'error', error: failure.message, retryable: failure.retryable });
        AccessibilityInfo.announceForAccessibility(`${row.name}: ${failure.message}`);
      } finally {
        controllersRef.current.delete(row.id);
      }
    },
    [categoryKey, onFormOutdated, patch, upload],
  );

  // Biten yükleme sıradakini başlatır; en son `run`'a (güncel kategoriye) bağlı kalması için ref üzerinden çağrılır.
  const pumpRef = useRef<() => void>(() => undefined);
  const pump = useCallback(() => {
    while (activeRef.current < FEEDBACK_MEDIA_LIMITS.maxParallelUploads && queueRef.current.length > 0) {
      const id = queueRef.current.shift();
      const row = rowsRef.current.find((entry) => entry.id === id);
      if (!row) continue;
      activeRef.current += 1;
      void run(row).finally(() => {
        activeRef.current -= 1;
        pumpRef.current();
      });
    }
  }, [run]);
  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const enqueue = useCallback(
    (ids: string[]) => {
      queueRef.current.push(...ids);
      pump();
    },
    [pump],
  );

  const addMedia = useCallback(
    (fieldKey: string, items: { asset: PickedMedia; kind: FeedbackMediaKind }[]) => {
      const created: InternalRow[] = items.map(({ asset, kind }) => ({
        id: uuidv4(),
        fieldKey,
        kind,
        name: asset.fileName?.trim() || (kind === 'video' ? 'video' : 'fotoğraf'),
        previewUri: asset.uri,
        status: 'queued',
        progress: 0,
        source: asset,
      }));
      rowsRef.current = [...rowsRef.current, ...created];
      setRows(rowsRef.current);
      enqueue(created.map((row) => row.id));
    },
    [enqueue],
  );

  /** Seçimde reddedilen dosya da satır olarak görünür (sessiz kesme yok); yalnız "Kaldır" sunulur. */
  const addRejected = useCallback((fieldKey: string, asset: PickedMedia, kind: FeedbackMediaKind, message: string) => {
    const row: InternalRow = {
      id: uuidv4(),
      fieldKey,
      kind,
      name: asset.fileName?.trim() || 'video',
      previewUri: asset.uri,
      status: 'error',
      progress: 0,
      error: message,
      retryable: false,
      source: asset,
    };
    rowsRef.current = [...rowsRef.current, row];
    setRows(rowsRef.current);
  }, []);

  const retry = useCallback(
    (id: string) => {
      patch(id, { status: 'queued', error: undefined, token: undefined, progress: 0 });
      enqueue([id]);
    },
    [enqueue, patch],
  );

  const remove = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    queueRef.current = queueRef.current.filter((entry) => entry !== id);
    rowsRef.current = rowsRef.current.filter((row) => row.id !== id);
    setRows(rowsRef.current);
  }, []);

  const clear = useCallback(() => {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
    queueRef.current = [];
    rowsRef.current = [];
    setRows([]);
  }, []);

  /** Gönderimde `attachment_invalid`: o alanın yüklenmiş dosyaları "yeniden yükle" durumuna alınır. */
  const markInvalid = useCallback(
    (fieldKeys: string[] | 'all', message: string) => {
      rowsRef.current = rowsRef.current.map((row) =>
        row.status === 'done' && (fieldKeys === 'all' || fieldKeys.includes(row.fieldKey))
          ? { ...row, status: 'error', error: message, retryable: true, token: undefined }
          : row,
      );
      setRows(rowsRef.current);
    },
    [],
  );

  useEffect(() => clear, [clear]);

  const attachments: UploadedAttachment[] = rows
    .filter((row) => row.status === 'done' && row.token)
    .map((row) => ({ fieldKey: row.fieldKey, token: row.token as string }));

  return {
    rows: rows.map(({ source: _source, file: _file, token: _token, ...row }): FeedbackUploadRow => row),
    attachments,
    hasPending: rows.some((row) => row.status === 'preparing' || row.status === 'queued' || row.status === 'uploading'),
    hasErrors: rows.some((row) => row.status === 'error'),
    addMedia,
    addRejected,
    retry,
    remove,
    clear,
    markInvalid,
  };
}
