import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StoreAdvantagesBand } from './store-advantages-band';

const WEB_FOOTER_ADVANTAGES = [
  ['Siparişleriniz', '24 Saatte Kargoda'],
  ['İade', '14 Gün Koşulsuz İade'],
  ['Ödeme', 'Kapıda Ödeme Kolaylığı'],
  ['Güvenlik', '%100 Güvenli Ödeme Sayfası'],
] as const;

describe('StoreAdvantagesBand', () => {
  it.each(['light', 'dark'] as const)(
    'shows the four advantages of the web footer, in order, in the %s theme',
    (theme) => {
      renderWithTamagui(<StoreAdvantagesBand />, theme);

      const labels = screen.getAllByLabelText(/^.+: .+$/).map((node) => node.props.accessibilityLabel);
      expect(labels).toEqual(WEB_FOOTER_ADVANTAGES.map(([caption, title]) => `${caption}: ${title}`));

      // Captions are upper-cased the Turkish way: "SİPARİŞLERİNİZ", never a dotless "SIPARIŞLERINIZ".
      ['SİPARİŞLERİNİZ', 'İADE', 'ÖDEME', 'GÜVENLİK'].forEach((caption) => {
        expect(screen.getByText(caption)).toBeTruthy();
      });
      WEB_FOOTER_ADVANTAGES.forEach(([, title]) => {
        expect(screen.getByText(title)).toBeTruthy();
      });
    },
  );

  it('lays the advantages out two per row', () => {
    renderWithTamagui(<StoreAdvantagesBand />);

    expect(screen.getByLabelText('Siparişleriniz: 24 Saatte Kargoda').props.style).toEqual(
      expect.objectContaining({ width: '50%' }),
    );
  });
});
