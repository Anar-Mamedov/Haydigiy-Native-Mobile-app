import { resolvePaymentRouterHandoff } from './payment-router-handoff';

describe('resolvePaymentRouterHandoff', () => {
  it('throws the router message on an error status', () => {
    expect(() => resolvePaymentRouterHandoff({ status: 'error', message: 'Limit aşıldı.' }, 1)).toThrow(
      'Limit aşıldı.',
    );
  });

  // VakıfBank (taksit / Enpara) de 3DS sayfasını `threeDSHtmlContent` ile döner.
  it('returns the bank-hosted 3DS page', () => {
    expect(
      resolvePaymentRouterHandoff({ status: 'success', threeDSHtmlContent: '<form></form>' }, 1),
    ).toEqual({ kind: 'hosted-3ds', handoff: { kind: 'iyzico-html', html: '<form></form>' } });
  });

  it('throws when the 3DS page is announced but empty', () => {
    expect(() => resolvePaymentRouterHandoff({ threeDSHtmlContent: '' }, 1)).toThrow(
      'İyzico ödeme sayfası açılamadı.',
    );
  });

  it('maps the Garanti form fields', () => {
    const handoff = resolvePaymentRouterHandoff(
      {
        gateway_url: 'https://garanti.example/3d',
        fields: { secure3dhash: 'HASH', terminalid: 'T1', txnamount: '25000' },
      },
      1,
    );

    expect(handoff.kind).toBe('garanti-form');
    if (handoff.kind !== 'garanti-form') return;
    expect(handoff.form).toMatchObject({
      gatewayUrl: 'https://garanti.example/3d',
      hashedData: 'HASH',
      terminalId: 'T1',
      amount: '25000',
      installmentCount: 1,
    });
  });

  it('refuses an unsupported gateway', () => {
    expect(() => resolvePaymentRouterHandoff({ status: 'success', OrderNumber: '1' }, 1)).toThrow(
      'Bu ödeme için kart altyapısı şu an kullanılamıyor',
    );
  });
});
