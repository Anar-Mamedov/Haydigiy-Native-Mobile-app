import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { FEEDBACK_MEDIA_LIMITS as LIMITS } from '../constants/feedback-media-limits';

export type FeedbackMediaKind = 'image' | 'video';

/** Galeriden seçilen öğe (expo-image-picker `ImagePickerAsset` alt kümesi). */
export type PickedMedia = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  type?: string | null;
  fileSize?: number | null;
  /** Milisaniye. */
  duration?: number | null;
};

const VIDEO_EXTENSIONS: Record<string, string> = { mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/mp4' };
/** Seçicinin süre yuvarlamasına pay (30,4 sn'lik video 30 sn sayılır). */
const DURATION_TOLERANCE_MS = 500;

const extensionOf = (value: string | null | undefined) => /\.([a-z0-9]+)(?:\?.*)?$/i.exec(value ?? '')?.[1]?.toLowerCase() ?? '';

export function getMediaKind(asset: PickedMedia): FeedbackMediaKind | null {
  if (asset.type === 'video' || asset.type === 'pairedVideo') return 'video';
  if (asset.type === 'image' || asset.type === 'livePhoto') return 'image';
  const mime = (asset.mimeType ?? '').toLowerCase();
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  return null;
}

/** Videonun MIME türü; seçici vermediyse uzantıdan çıkarılır (iPhone `.MOV` → video/quicktime). */
export function getVideoMimeType(asset: PickedMedia): string {
  const mime = (asset.mimeType ?? '').toLowerCase();
  if (mime) return mime;
  return VIDEO_EXTENSIONS[extensionOf(asset.fileName) || extensionOf(asset.uri)] ?? '';
}

export function getVideoFileName(asset: PickedMedia, mimeType: string): string {
  if (asset.fileName?.trim()) return asset.fileName.trim();
  return mimeType === 'video/quicktime' ? 'video.mov' : 'video.mp4';
}

/** Videonun yüklenebilirliği; boyut/süre bilinmiyorsa son karar sunucuda. */
export function checkVideo(asset: PickedMedia, accept: readonly string[]): string | null {
  if (!accept.includes(getVideoMimeType(asset))) return T.fileTypeNotAllowed;
  if (typeof asset.fileSize === 'number' && asset.fileSize > LIMITS.maxVideoBytes) return T.videoTooLarge;
  if (typeof asset.duration === 'number' && asset.duration > LIMITS.maxVideoSeconds * 1000 + DURATION_TOLERANCE_MS) {
    return T.videoTooLarge;
  }
  return null;
}

type SelectionParams = {
  assets: PickedMedia[];
  currentCount: number;
  currentVideoCount: number;
  maxFiles: number;
};

/**
 * Yeni seçimi sınırlara göre ayırır: fazla dosya ve ikinci video SESSİZCE kesilmez, uyarı döner
 * (sözleşme v1.0 §7.1).
 */
export function planMediaSelection({ assets, currentCount, currentVideoCount, maxFiles }: SelectionParams) {
  const accepted: { asset: PickedMedia; kind: FeedbackMediaKind }[] = [];
  const warnings = new Set<string>();
  let videos = currentVideoCount;

  for (const asset of assets) {
    const kind = getMediaKind(asset);
    if (!kind) {
      warnings.add(T.fileTypeNotAllowed);
      continue;
    }
    if (currentCount + accepted.length >= maxFiles) {
      warnings.add(T.tooManyFiles(maxFiles));
      break;
    }
    if (kind === 'video' && videos >= LIMITS.maxVideosPerSubmission) {
      warnings.add(T.oneVideoOnly);
      continue;
    }
    if (kind === 'video') videos += 1;
    accepted.push({ asset, kind });
  }

  return { accepted, warnings: [...warnings] };
}
