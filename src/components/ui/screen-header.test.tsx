import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from 'tamagui';
import { ScreenHeader } from '@/components/ui/screen-header';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ScreenHeader', () => {
  it('renders the title and an optional trailing element', () => {
    renderWithTamagui(
      <ScreenHeader onBack={jest.fn()} right={<Paragraph>Action</Paragraph>} title="Kuponlarım" />,
    );

    expect(screen.getByText('Kuponlarım')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();
  });

  it('calls onBack when the back button is pressed', () => {
    const onBack = jest.fn();
    renderWithTamagui(<ScreenHeader onBack={onBack} title="Kuponlarım" />);

    fireEvent.press(screen.getByLabelText('Geri dön'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
