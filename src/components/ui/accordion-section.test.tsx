import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AccordionSection } from '@/components/ui/accordion-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const Body = () => <Paragraph>Gizli içerik</Paragraph>;

describe('AccordionSection', () => {
  it('shows the title and hides the body when collapsed', () => {
    renderWithTamagui(
      <AccordionSection expanded={false} onToggle={jest.fn()} title="Çerez Politikası">
        <Body />
      </AccordionSection>,
    );

    expect(screen.getByText('Çerez Politikası')).toBeTruthy();
    expect(screen.queryByText('Gizli içerik')).toBeNull();
    expect(screen.getByLabelText('Çerez Politikası').props.accessibilityState).toMatchObject({
      expanded: false,
    });
  });

  it('renders the body and marks expanded when open', () => {
    renderWithTamagui(
      <AccordionSection expanded onToggle={jest.fn()} title="Çerez Politikası">
        <Body />
      </AccordionSection>,
    );

    expect(screen.getByText('Gizli içerik')).toBeTruthy();
    expect(screen.getByLabelText('Çerez Politikası').props.accessibilityState).toMatchObject({
      expanded: true,
    });
  });

  it('calls onToggle when the header is pressed', () => {
    const onToggle = jest.fn();
    renderWithTamagui(
      <AccordionSection expanded={false} onToggle={onToggle} title="Çerez Politikası">
        <Body />
      </AccordionSection>,
    );

    fireEvent.press(screen.getByLabelText('Çerez Politikası'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('keeps the title visible in dark theme', () => {
    renderWithTamagui(
      <AccordionSection expanded onToggle={jest.fn()} title="Kullanım Koşulları">
        <Body />
      </AccordionSection>,
      'dark',
    );

    expect(screen.getByText('Kullanım Koşulları')).toBeTruthy();
  });
});
