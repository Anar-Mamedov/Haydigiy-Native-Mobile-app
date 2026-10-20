import { ASSISTANT_URL_CONTRACT as contract } from '../__fixtures__';
import { resolveAssistantLinkTarget, SITE_ORIGIN } from './assistant-link-target';

const route = (path: string) => ({ type: 'route', path });

describe('resolveAssistantLinkTarget', () => {
  it('giriş sarmalı: misafir Hesabım (giriş) ekranına, girişli müşteri hedef ekrana gider', () => {
    const orders = contract.links.orders_active.mobile;
    expect(resolveAssistantLinkTarget(orders, false)).toEqual(route('/profile'));
    expect(resolveAssistantLinkTarget(orders, true)).toEqual(
      route('/orders?category=active&src=haydi-asistan'),
    );
  });

  it('sipariş detayı, iade ve iptalin mobil adresleri native ekranlara eşlenir', () => {
    const { order_detail, return_request, cancel_order } = contract.parameterized;
    expect(resolveAssistantLinkTarget(order_detail.mobile, true)).toEqual(
      route('/order/100001?src=haydi-asistan'),
    );
    expect(resolveAssistantLinkTarget(return_request.mobile, true)).toEqual(
      route('/return-create/100001?src=haydi-asistan'),
    );
    expect(resolveAssistantLinkTarget(cancel_order.mobile, true)).toEqual(
      route('/order-cancel/100001?src=haydi-asistan'),
    );
  });

  it('"Faturamı aç": girişli müşteri sipariş ekranına fatura=1 ile gider, misafir Hesabım ekranına', () => {
    const href = '/giris?returnUrl=%2Fm%2Fhesabim%2Fsiparislerim%2F100001%3Ffatura%3D1%26src%3Dhaydi-asistan';
    expect(resolveAssistantLinkTarget(href, true)).toEqual(
      route('/order/100001?fatura=1&src=haydi-asistan'),
    );
    expect(resolveAssistantLinkTarget(href, false)).toEqual(route('/profile'));
  });

  it('hızlı giriş, üye ol ve şifremi unuttum Hesabım ekranındaki giriş akışına gider', () => {
    expect(resolveAssistantLinkTarget(contract.links.login.mobile, false)).toEqual(route('/profile'));
    expect(resolveAssistantLinkTarget(contract.links.login.mobile, true)).toEqual(route('/profile'));
    expect(resolveAssistantLinkTarget(contract.links.register.mobile, false)).toEqual(route('/profile'));
    expect(resolveAssistantLinkTarget(contract.links.forgot_password.mobile, false)).toEqual(
      route('/profile'),
    );
  });

  it('herkese açık sayfalar: kategori, yardım, sepet, ürün', () => {
    expect(resolveAssistantLinkTarget(contract.parameterized.category_page.mobile, false)).toEqual(
      route('/kategori/kadin-elbise?c=12&src=haydi-asistan'),
    );
    expect(resolveAssistantLinkTarget(contract.links.help_shipping.mobile, false)).toEqual(
      route('/help?kategori=kargo-teslimat'),
    );
    expect(resolveAssistantLinkTarget(contract.links.cart.mobile, false)).toEqual(route('/cart'));
    expect(resolveAssistantLinkTarget('/siyah-crop-esofman?src=haydi-asistan', false)).toEqual(
      route('/product/siyah-crop-esofman'),
    );
  });

  it('genel çözücüde eksik kalan sorularım yolu eşlenir', () => {
    expect(resolveAssistantLinkTarget(contract.links.account_questions.mobile, true)).toEqual(
      route('/questions'),
    );
  });

  it('uygulamada karşılığı olmayan sayfa sitede (uygulama içi tarayıcı) açılır, adres değişmez', () => {
    const href = '/kampanya/sonbahar?src=haydi-asistan';
    expect(resolveAssistantLinkTarget(href, false)).toEqual({ type: 'web', url: `${SITE_ORIGIN}${href}` });
    expect(resolveAssistantLinkTarget(contract.links.contact.mobile, false)).toEqual({
      type: 'web',
      url: `${SITE_ORIGIN}/iletisim?src=haydi-asistan`,
    });
  });

  it('url-contract içindeki hiçbir geçerli adres ana sayfaya düşmez', () => {
    const pairs = [...Object.values(contract.links), ...Object.values(contract.parameterized)] as {
      mobile: string;
    }[];
    pairs.forEach(({ mobile }) => {
      const target = resolveAssistantLinkTarget(mobile, true);
      expect(target.type === 'route' ? target.path : target.url).not.toBe('/');
    });
  });
});
