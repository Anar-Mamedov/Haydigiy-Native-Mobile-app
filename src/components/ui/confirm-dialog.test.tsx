import { fireEvent, screen } from '@testing-library/react-native';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ConfirmDialog', () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Favorilerden Kaldır',
    description: 'Emin misiniz?',
    confirmLabel: 'Evet, Kaldır',
    cancelLabel: 'Vazgeç',
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, description and action labels when open', () => {
    renderWithTamagui(<ConfirmDialog {...baseProps} />);

    expect(screen.getByText('Favorilerden Kaldır')).toBeTruthy();
    expect(screen.getByText('Emin misiniz?')).toBeTruthy();
    expect(screen.getByText('Evet, Kaldır')).toBeTruthy();
    expect(screen.getByText('Vazgeç')).toBeTruthy();
  });

  it('calls onConfirm when the confirm button is pressed', () => {
    const onConfirm = jest.fn();
    renderWithTamagui(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    fireEvent.press(screen.getByText('Evet, Kaldır'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render content when closed', () => {
    renderWithTamagui(<ConfirmDialog {...baseProps} open={false} />);

    expect(screen.queryByText('Favorilerden Kaldır')).toBeNull();
  });
});
