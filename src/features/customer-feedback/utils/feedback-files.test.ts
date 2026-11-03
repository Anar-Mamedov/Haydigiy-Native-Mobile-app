import { checkVideo, getMediaKind, getVideoMimeType, planMediaSelection } from './feedback-files';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
const image = (name: string) => ({ uri: `file:///${name}`, fileName: name, type: 'image' });
const video = (name: string, extra: object = {}) => ({ uri: `file:///${name}`, fileName: name, type: 'video', ...extra });

describe('feedback files (sözleşme v1.0 §7)', () => {
  it('detects kind and the iPhone .MOV mime type', () => {
    expect(getMediaKind(image('a.jpg'))).toBe('image');
    expect(getMediaKind({ uri: 'x', mimeType: 'video/mp4' })).toBe('video');
    expect(getMediaKind({ uri: 'x', mimeType: 'application/pdf' })).toBeNull();
    expect(getVideoMimeType(video('IMG_1.MOV'))).toBe('video/quicktime');
  });

  it('rejects videos over 25 MB / 30 s or of another type', () => {
    expect(checkVideo(video('a.mp4', { fileSize: 26 * 1024 * 1024 }), ACCEPT)).toMatch(/25 MB/);
    expect(checkVideo(video('a.mp4', { duration: 45_000 }), ACCEPT)).toMatch(/30 saniye/);
    expect(checkVideo(video('a.webm', { mimeType: 'video/webm' }), ACCEPT)).toMatch(/Yalnız görsel/);
    expect(checkVideo(video('a.mp4', { fileSize: 9_000_000, duration: 29_900 }), ACCEPT)).toBeNull();
  });

  it('warns instead of silently cutting extra files and a second video', () => {
    const plan = planMediaSelection({
      assets: [video('1.mp4'), video('2.mp4'), image('a.jpg'), image('b.jpg'), image('c.jpg')],
      currentCount: 2,
      currentVideoCount: 0,
      maxFiles: 5,
    });

    expect(plan.accepted.map(({ asset }) => asset.fileName)).toEqual(['1.mp4', 'a.jpg', 'b.jpg']);
    expect(plan.warnings).toEqual(['Başvuruya en fazla 1 video eklenebilir.', 'En çok 5 dosya ekleyebilirsiniz.']);
  });
});
