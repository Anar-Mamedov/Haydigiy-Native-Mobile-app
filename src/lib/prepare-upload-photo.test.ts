import { prepareUploadPhoto } from './prepare-upload-photo';

type FakeImage = { width: number; height: number; saveAsync: jest.Mock };
type FakeContext = { resize: jest.Mock; renderAsync: jest.Mock };

const mockManipulate = jest.fn();

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: (source: unknown) => mockManipulate(source) },
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
}));

function fakeImage(width: number, height: number, savedUri: string): FakeImage {
  return { width, height, saveAsync: jest.fn(async () => ({ uri: savedUri, width, height })) };
}

function fakeContext(rendered: FakeImage): FakeContext {
  const context: FakeContext = {
    resize: jest.fn((): FakeContext => context),
    renderAsync: jest.fn(async () => rendered),
  };
  return context;
}

describe('prepareUploadPhoto', () => {
  beforeEach(() => {
    mockManipulate.mockReset();
  });

  it('converts an iPhone HEIC photo to a resized JPEG', async () => {
    const original = fakeImage(4284, 5712, 'file:///original.jpg');
    const resized = fakeImage(1536, 2048, 'file:///resized.jpg');
    const resizeContext = fakeContext(resized);
    mockManipulate.mockReturnValueOnce(fakeContext(original)).mockReturnValueOnce(resizeContext);

    const photo = await prepareUploadPhoto({ uri: 'file:///IMG_1234.heic', fileName: 'IMG_1234.HEIC' });

    expect(mockManipulate).toHaveBeenNthCalledWith(1, 'file:///IMG_1234.heic');
    expect(mockManipulate).toHaveBeenNthCalledWith(2, original);
    expect(resizeContext.resize).toHaveBeenCalledWith({ width: null, height: 2048 });
    expect(resized.saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.85 });
    expect(photo).toEqual({ uri: 'file:///resized.jpg', name: 'IMG_1234.jpg', type: 'image/jpeg' });
  });

  it('only re-encodes a photo that is already small enough', async () => {
    const original = fakeImage(1200, 900, 'file:///small.jpg');
    mockManipulate.mockReturnValueOnce(fakeContext(original));

    const photo = await prepareUploadPhoto({ uri: 'file:///small.png', fileName: null });

    expect(mockManipulate).toHaveBeenCalledTimes(1);
    expect(original.saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.85 });
    expect(photo).toEqual({ uri: 'file:///small.jpg', name: 'photo.jpg', type: 'image/jpeg' });
  });

  it('rejects when the photo cannot be decoded', async () => {
    mockManipulate.mockReturnValueOnce({
      resize: jest.fn(),
      renderAsync: jest.fn(async () => {
        throw new Error('decode failed');
      }),
    });

    await expect(prepareUploadPhoto({ uri: 'file:///broken.heic' })).rejects.toThrow('decode failed');
  });
});
