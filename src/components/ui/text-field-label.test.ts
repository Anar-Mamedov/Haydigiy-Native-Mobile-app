import { getTextFieldLabelProps } from './text-field-label';

describe('getTextFieldLabelProps', () => {
  it('names the field with accessibilityLabel on iOS', () => {
    expect(getTextFieldLabelProps({ label: 'Şifre', labelId: 'password-label', platform: 'ios' })).toEqual({
      accessibilityLabel: 'Şifre',
    });
  });

  it('links the visible label on Android instead of setting a contentDescription', () => {
    // Regresyon: Play "Düzenlenebilir öğe etiketi" uyarısı, EditText'e verilen
    // accessibilityLabel'ın contentDescription olmasından geliyordu.
    const props = getTextFieldLabelProps({
      label: 'E-posta veya Telefon Numarası',
      labelId: 'login-identifier-label',
      placeholder: 'E-posta veya telefon (5xxxxxxxxx)',
      platform: 'android',
    });

    expect(props).toEqual({ accessibilityLabelledBy: 'login-identifier-label' });
    expect(props).not.toHaveProperty('accessibilityLabel');
  });

  it('lets the placeholder hint name a field without a visible label on Android', () => {
    expect(getTextFieldLabelProps({ label: 'Ürün veya kategori ara', placeholder: 'Ara', platform: 'android' })).toEqual(
      {},
    );
  });

  it('falls back to accessibilityLabel on Android when nothing else can name the field', () => {
    expect(getTextFieldLabelProps({ label: 'Kupon kodu', platform: 'android' })).toEqual({
      accessibilityLabel: 'Kupon kodu',
    });
  });
});
