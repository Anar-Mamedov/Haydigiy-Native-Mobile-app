import { UPLOAD_PHOTO_MAX_EDGE, getUploadPhotoResize, toJpegFileName } from './upload-photo';

describe('getUploadPhotoResize', () => {
  it('limits the long edge of a portrait iPhone photo', () => {
    expect(getUploadPhotoResize(4284, 5712)).toEqual({ width: null, height: UPLOAD_PHOTO_MAX_EDGE });
  });

  it('limits the long edge of a landscape photo', () => {
    expect(getUploadPhotoResize(8064, 6048)).toEqual({ width: UPLOAD_PHOTO_MAX_EDGE, height: null });
  });

  it('leaves photos within the limit untouched', () => {
    expect(getUploadPhotoResize(1200, 900)).toBeNull();
    expect(getUploadPhotoResize(UPLOAD_PHOTO_MAX_EDGE, 1000)).toBeNull();
  });

  it('skips resizing when the size is unknown', () => {
    expect(getUploadPhotoResize(0, 0)).toBeNull();
    expect(getUploadPhotoResize(Number.NaN, Number.NaN)).toBeNull();
  });
});

describe('toJpegFileName', () => {
  it('swaps the extension for .jpg', () => {
    expect(toJpegFileName('IMG_1234.HEIC')).toBe('IMG_1234.jpg');
    expect(toJpegFileName('kusurlu.urun.png')).toBe('kusurlu.urun.jpg');
    expect(toJpegFileName('adsiz')).toBe('adsiz.jpg');
  });

  it('falls back to a default name', () => {
    expect(toJpegFileName('')).toBe('photo.jpg');
    expect(toJpegFileName(null)).toBe('photo.jpg');
    expect(toJpegFileName(undefined)).toBe('photo.jpg');
  });
});
