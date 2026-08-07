import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { CopyField } from '@/components/ui/copy-field';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

describe('CopyField', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the label and value', () => {
    renderWithTamagui(<CopyField label="KUPON KODU" value="IADEHG123456" />);

    expect(screen.getByText('KUPON KODU')).toBeTruthy();
    expect(screen.getByText('IADEHG123456')).toBeTruthy();
  });

  it('copies the value to the clipboard when the button is pressed', async () => {
    renderWithTamagui(<CopyField label="KUPON KODU" value="IADEHG123456" />);

    fireEvent.press(screen.getByLabelText('KUPON KODU kopyala'));

    await waitFor(() => expect(Clipboard.setStringAsync).toHaveBeenCalledWith('IADEHG123456'));
  });

  it('uses the given accessibility label when provided', () => {
    renderWithTamagui(
      <CopyField
        accessibilityLabel="IADEHG123456 kupon kodunu kopyala"
        label="KUPON KODU"
        value="IADEHG123456"
      />,
    );

    expect(screen.getByLabelText('IADEHG123456 kupon kodunu kopyala')).toBeTruthy();
  });

  it('keeps the value readable in the dark theme', () => {
    renderWithTamagui(<CopyField label="KUPON KODU" value="IADEHG123456" />, 'dark');

    expect(screen.getByText('IADEHG123456')).toBeTruthy();
  });
});
