import { Linking } from 'react-native';
import {
  WHATSAPP_SUPPORT_PHONE,
  buildWhatsappUrl,
  openWhatsapp,
} from './whatsapp';

jest.mock('react-native', () => ({
  Linking: { openURL: jest.fn() },
}));

const openURL = Linking.openURL as jest.Mock;

beforeEach(() => {
  openURL.mockReset();
  openURL.mockResolvedValue(true);
});

describe('buildWhatsappUrl', () => {
  it('builds the universal wa.me link with the encoded message', () => {
    expect(buildWhatsappUrl('Merhaba')).toBe(`https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=Merhaba`);
    expect(buildWhatsappUrl('Ürün A - 42\nhttps://haydigiy.com/product/urun-a')).toBe(
      `https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=%C3%9Cr%C3%BCn%20A%20-%2042%0Ahttps%3A%2F%2Fhaydigiy.com%2Fproduct%2Furun-a`,
    );
  });

  it('omits the text parameter for an empty message', () => {
    expect(buildWhatsappUrl()).toBe(`https://wa.me/${WHATSAPP_SUPPORT_PHONE}`);
    expect(buildWhatsappUrl('   ')).toBe(`https://wa.me/${WHATSAPP_SUPPORT_PHONE}`);
  });
});

describe('openWhatsapp', () => {
  /**
   * Regresyon: ürün detayındaki buton `whatsapp://` şemasını `canOpenURL` ile kontrol
   * ediyordu. iOS'ta `LSApplicationQueriesSchemes` tanımlı olmadığı için o yol hiç
   * çalışmıyor ve zincirde `catch` olmadığından buton sessizce ölüyordu.
   */
  it('never uses the whatsapp:// custom scheme', async () => {
    await openWhatsapp('Merhaba');

    expect(openURL).toHaveBeenCalledTimes(1);
    const url = openURL.mock.calls[0][0] as string;
    expect(url.startsWith('https://wa.me/')).toBe(true);
    expect(url).not.toContain('whatsapp://');
  });

  it('swallows a failed open instead of leaving an unhandled rejection', async () => {
    openURL.mockRejectedValue(new Error('no handler'));

    await expect(openWhatsapp('Merhaba')).resolves.toBeUndefined();
  });

  it('accepts a different phone number', async () => {
    await openWhatsapp('Merhaba', '905550000000');

    expect(openURL).toHaveBeenCalledWith('https://wa.me/905550000000?text=Merhaba');
  });
});
