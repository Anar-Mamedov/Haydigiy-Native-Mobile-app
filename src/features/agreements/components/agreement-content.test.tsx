import { fireEvent, screen } from '@testing-library/react-native';
import { AgreementContent } from './agreement-content';
import { AgreementBlock } from '../data/agreement.types';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const BLOCKS: AgreementBlock[] = [
  { type: 'paragraph', text: 'Giriş paragrafı.' },
  { type: 'heading', text: 'Başlık' },
  { type: 'subheading', text: 'Alt Başlık' },
  { type: 'term', term: 'Platform', text: 'Tanım metni.' },
  { type: 'bullet', text: 'Madde metni.', lead: 'Önek:' },
];

describe('AgreementContent', () => {
  it('renders every block type (paragraph, heading, subheading, term, bullet)', () => {
    renderWithTamagui(<AgreementContent blocks={BLOCKS} />);

    expect(screen.getByText('Giriş paragrafı.')).toBeTruthy();
    expect(screen.getByText('Başlık')).toBeTruthy();
    expect(screen.getByText('Alt Başlık')).toBeTruthy();
    expect(screen.getByText('Platform')).toBeTruthy();
    expect(screen.getByText('Tanım metni.')).toBeTruthy();
    expect(screen.getByText(/Önek:/)).toBeTruthy();
    expect(screen.getByText(/Madde metni\./)).toBeTruthy();
  });

  it('opens a link block through the host handler with its web path', () => {
    const onLinkPress = jest.fn();
    renderWithTamagui(
      <AgreementContent
        blocks={[{ type: 'link', text: 'Çerez Politikası', href: '/cerez-politikasi' }]}
        onLinkPress={onLinkPress}
      />,
    );

    fireEvent.press(screen.getByRole('link', { name: 'Çerez Politikası' }));

    expect(onLinkPress).toHaveBeenCalledWith('/cerez-politikasi');
  });

  it('renders a link block as plain text when the host cannot navigate', () => {
    renderWithTamagui(
      <AgreementContent blocks={[{ type: 'link', text: 'Çerez Politikası', href: '/cerez-politikasi' }]} />,
      'dark',
    );

    expect(screen.getByText('Çerez Politikası')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
