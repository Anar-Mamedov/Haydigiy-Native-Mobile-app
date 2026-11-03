import { fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import fixture from '../__fixtures__/forms-general.json';
import { CustomerFeedbackSheet } from './customer-feedback-sheet';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'customer-feedback-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'customer-feedback-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  VideoExportPreset: { H264_1280x720: 6 },
}));
jest.mock('@/lib/prepare-upload-photo', () => ({ prepareUploadPhoto: jest.fn() }));
jest.mock('@/services/customer-feedback.service', () => ({
  IMAGE_UPLOAD_TIMEOUT_MS: 60_000,
  VIDEO_UPLOAD_TIMEOUT_MS: 180_000,
  getFeedbackFormDto: jest.fn(),
  uploadFeedbackAttachmentDto: jest.fn(),
  submitCustomerFeedbackDto: jest.fn(),
}));

const service = jest.requireMock('@/services/customer-feedback.service') as { getFeedbackFormDto: jest.Mock };

beforeEach(() => service.getFeedbackFormDto.mockResolvedValue(fixture.data));

describe('CustomerFeedbackSheet (kanonik form sheet)', () => {
  it('moves with the keyboard, fits its content and never dismisses on snap', () => {
    renderWithTamagui(<CustomerFeedbackSheet onOpenChange={jest.fn()} open />);
    const sheet = screen.getByTestId('customer-feedback-sheet');

    expect(sheet.props.moveOnKeyboardChange).toBe(true);
    expect(sheet.props.snapPointsMode).toBe('fit');
    expect(sheet.props.snapPoints).toBeUndefined();
    expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();
    expect(sheet.props.dismissOnOverlayPress).toBe(true);
  });

  it('bounds the frame and covers the strip below it', () => {
    renderWithTamagui(<CustomerFeedbackSheet onOpenChange={jest.fn()} open />);
    const frame = screen.getByTestId('customer-feedback-sheet-frame');

    expect(frame.props.maxHeight).toBe('92%');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(StyleSheet.flatten(screen.getByTestId('customer-feedback-sheet-bottom-cover').props.style)?.height).toBe(84);
  });

  it('renders the form through the keyboard-aware scroller without bounce and with labelled inputs', async () => {
    const onOpenChange = jest.fn();
    renderWithTamagui(<CustomerFeedbackSheet onOpenChange={onOpenChange} open productId={12} />);
    const scroll = screen.getByTestId('customer-feedback-keyboard-aware-scroll');

    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.overScrollMode).toBe('never');

    fireEvent.press(await screen.findByLabelText('Diğer, Yukarıdaki kategoriler dışında kalan konular'));
    for (const label of ['Açıklama *', 'Ad Soyad (isteğe bağlı)', 'E-posta (isteğe bağlı)', 'Telefon (isteğe bağlı)']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }

    fireEvent.press(screen.getByLabelText('Kapat'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
