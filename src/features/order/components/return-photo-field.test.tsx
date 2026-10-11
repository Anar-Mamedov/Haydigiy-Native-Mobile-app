import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReturnPhotoField } from './return-photo-field';

const mockRequestPermission = jest.fn();
const mockLaunchLibrary = jest.fn();
const mockPrepareUploadPhoto = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () => mockRequestPermission(),
  launchImageLibraryAsync: (options: unknown) => mockLaunchLibrary(options),
}));

jest.mock('@/lib/prepare-upload-photo', () => ({
  prepareUploadPhoto: (photo: unknown) => mockPrepareUploadPhoto(photo),
}));

// iPhone galerisinden gelen orijinal dosya (backend HEIC kabul etmiyor).
const HEIC_ASSET = { uri: 'file:///IMG_1234.heic', fileName: 'IMG_1234.HEIC', mimeType: 'image/heic' };
const PREPARED = { uri: 'file:///prepared.jpg', name: 'IMG_1234.jpg', type: 'image/jpeg' };

function renderField(theme?: 'light' | 'dark') {
  const onPhotoChange = jest.fn();
  renderWithTamagui(<ReturnPhotoField onPhotoChange={onPhotoChange} />, theme);
  return { onPhotoChange };
}

describe('ReturnPhotoField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockRequestPermission.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [HEIC_ASSET] });
  });

  it('asks for a photo until one is chosen', () => {
    renderField();

    expect(screen.getByLabelText('Fotoğraf yükle')).toBeTruthy();
    expect(screen.getByText('Bu iade nedeni için fotoğraf zorunludur.')).toBeTruthy();
  });

  it('hands over the JPEG prepared from the picked HEIC photo', async () => {
    mockPrepareUploadPhoto.mockResolvedValue(PREPARED);
    const { onPhotoChange } = renderField();

    fireEvent.press(screen.getByLabelText('Fotoğraf yükle'));

    await waitFor(() => expect(onPhotoChange).toHaveBeenCalledWith(PREPARED));
    expect(mockLaunchLibrary).toHaveBeenCalledWith({ mediaTypes: ['images'], quality: 1 });
    expect(mockPrepareUploadPhoto).toHaveBeenCalledWith(HEIC_ASSET);
  });

  it('shows progress while the photo is being prepared', async () => {
    let finish: (photo: typeof PREPARED) => void = () => undefined;
    mockPrepareUploadPhoto.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { onPhotoChange } = renderField();

    fireEvent.press(screen.getByLabelText('Fotoğraf yükle'));

    expect(await screen.findByText('Fotoğraf hazırlanıyor...')).toBeTruthy();
    expect(screen.queryByLabelText('Fotoğraf yükle')).toBeNull();
    expect(screen.queryByText('Bu iade nedeni için fotoğraf zorunludur.')).toBeNull();

    await act(async () => finish(PREPARED));
    expect(onPhotoChange).toHaveBeenCalledWith(PREPARED);
  });

  it('explains the failure and keeps the photo empty when preparing fails', async () => {
    mockPrepareUploadPhoto.mockRejectedValue(new Error('decode failed'));
    const { onPhotoChange } = renderField();

    fireEvent.press(screen.getByLabelText('Fotoğraf yükle'));

    expect(await screen.findByText('Fotoğraf işlenemedi. Lütfen başka bir fotoğraf seçin.')).toBeTruthy();
    expect(onPhotoChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Fotoğraf yükle')).toBeTruthy();
  });

  it('does nothing when the picker is cancelled', async () => {
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] });
    const { onPhotoChange } = renderField();

    fireEvent.press(screen.getByLabelText('Fotoğraf yükle'));

    await waitFor(() => expect(mockLaunchLibrary).toHaveBeenCalled());
    expect(mockPrepareUploadPhoto).not.toHaveBeenCalled();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('shows the chosen photo with a remove control', () => {
    const onPhotoChange = jest.fn();
    renderWithTamagui(<ReturnPhotoField onPhotoChange={onPhotoChange} photo={PREPARED} />);

    fireEvent.press(screen.getByLabelText('Fotoğrafı kaldır'));

    expect(onPhotoChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText('Bu iade nedeni için fotoğraf zorunludur.')).toBeNull();
  });

  it('keeps the labels readable in the dark theme', () => {
    renderField('dark');

    expect(screen.getByText('Fotoğraf Yükle')).toBeTruthy();
    expect(screen.getByText('Bu iade nedeni için fotoğraf zorunludur.')).toBeTruthy();
  });
});
