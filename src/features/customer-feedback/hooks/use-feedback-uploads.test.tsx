import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useFeedbackUploads } from './use-feedback-uploads';

jest.mock('@/lib/prepare-upload-photo', () => ({
  prepareUploadPhoto: jest.fn(async ({ uri }: { uri: string }) => ({ uri: `${uri}.jpg`, name: 'foto.jpg', type: 'image/jpeg' })),
}));
jest.mock('@/services/customer-feedback.service', () => ({
  IMAGE_UPLOAD_TIMEOUT_MS: 60_000,
  VIDEO_UPLOAD_TIMEOUT_MS: 180_000,
  uploadFeedbackAttachmentDto: jest.fn(),
}));

const { uploadFeedbackAttachmentDto } = jest.requireMock('@/services/customer-feedback.service') as { uploadFeedbackAttachmentDto: jest.Mock };

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const image = (name: string) => ({ asset: { uri: `file:///${name}`, fileName: name, type: 'image' }, kind: 'image' as const });
const video = (name: string) => ({ asset: { uri: `file:///${name}`, fileName: name, type: 'video', mimeType: 'video/quicktime' }, kind: 'video' as const });
const http = (status: number, data: unknown) => Object.assign(new Error('x'), { response: { status, data, headers: {} } });

beforeEach(() => jest.clearAllMocks());

describe('useFeedbackUploads', () => {
  it('uploads at most two files at a time and keeps tokens out of the rows', async () => {
    const pending: ((value: unknown) => void)[] = [];
    uploadFeedbackAttachmentDto.mockImplementation(
      () => new Promise((resolve) => pending.push(() => resolve({ upload_token: `tok-${pending.length}` }))),
    );
    const onOutdated = jest.fn();
    const { result } = renderHook(() => useFeedbackUploads('site_issues', onOutdated), { wrapper });

    act(() => result.current.addMedia('attachments', [image('a.png'), image('b.png'), video('c.MOV')]));
    await waitFor(() => expect(uploadFeedbackAttachmentDto).toHaveBeenCalledTimes(2));
    expect(result.current.hasPending).toBe(true);

    await act(async () => pending.shift()?.(undefined));
    await waitFor(() => expect(uploadFeedbackAttachmentDto).toHaveBeenCalledTimes(3));
    await act(async () => {
      pending.splice(0).forEach((resolve) => resolve(undefined));
    });

    await waitFor(() => expect(result.current.attachments).toHaveLength(3));
    const videoCall = uploadFeedbackAttachmentDto.mock.calls[2][0];
    expect(videoCall).toMatchObject({ categoryKey: 'site_issues', fieldKey: 'attachments', timeout: 180_000 });
    expect(videoCall.file).toEqual({ uri: 'file:///c.MOV', name: 'c.MOV', type: 'video/quicktime' });
    expect(result.current.rows.every((row) => !('token' in row))).toBe(true);
    expect(result.current.hasPending).toBe(false);
  });

  it('maps server rejections to the file row and lets the customer retry storage errors', async () => {
    uploadFeedbackAttachmentDto
      .mockRejectedValueOnce(http(422, { code: 'file_type_not_allowed', errors: { file: 'Bu dosya türü kabul edilmiyor.' } }))
      .mockRejectedValueOnce(http(503, { code: 'cdn_unavailable' }))
      .mockResolvedValueOnce({ upload_token: 'ok' });
    const { result } = renderHook(() => useFeedbackUploads('site_issues', jest.fn()), { wrapper });

    act(() => result.current.addMedia('attachments', [image('a.png')]));
    await waitFor(() => expect(result.current.rows[0]?.status).toBe('error'));
    expect(result.current.rows[0]).toMatchObject({ error: 'Bu dosya türü kabul edilmiyor.', retryable: false });

    act(() => result.current.addMedia('attachments', [image('b.png')]));
    await waitFor(() => expect(result.current.rows[1]?.status).toBe('error'));
    expect(result.current.rows[1]).toMatchObject({ error: 'Dosya şu an yüklenemedi, tekrar deneyin.', retryable: true });
    expect(result.current.hasErrors).toBe(true);

    act(() => result.current.retry(result.current.rows[1].id));
    await waitFor(() => expect(result.current.rows[1]?.status).toBe('done'));
    act(() => result.current.remove(result.current.rows[0].id));
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.attachments).toEqual([{ fieldKey: 'attachments', token: 'ok' }]);
  });

  it('turns uploaded files back into "re-upload" rows on attachment_invalid and refreshes on form_outdated', async () => {
    uploadFeedbackAttachmentDto.mockResolvedValueOnce({ upload_token: 'old' }).mockRejectedValueOnce(http(422, { code: 'form_outdated' }));
    const onOutdated = jest.fn();
    const { result } = renderHook(() => useFeedbackUploads('site_issues', onOutdated), { wrapper });

    act(() => result.current.addMedia('attachments', [image('a.png')]));
    await waitFor(() => expect(result.current.attachments).toHaveLength(1));
    act(() => result.current.markInvalid(['attachments'], 'Dosya geçersiz ya da süresi dolmuş, yeniden yükleyin.'));
    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.rows[0]).toMatchObject({ status: 'error', retryable: true });

    act(() => result.current.addMedia('attachments', [image('b.png')]));
    await waitFor(() => expect(onOutdated).toHaveBeenCalled());
  });
});
