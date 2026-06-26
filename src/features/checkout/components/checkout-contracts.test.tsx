import { fireEvent, screen } from '@testing-library/react-native';
import { AgreementConsentCard, ContractPreviewContent } from './checkout-contracts';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ContractPreviewContent', () => {
  it('renders the frontend-style contract preview sections', () => {
    renderWithTamagui(
      <ContractPreviewContent onOpenDistanceSales={jest.fn()} onOpenPreInfo={jest.fn()} />,
    );

    expect(screen.getByText('1. Mesafeli Satış Sözleşmesi')).toBeTruthy();
    expect(screen.getByText('1. TARAFLAR')).toBeTruthy();
    expect(screen.getByText('Ön Bilgilendirme Formu')).toBeTruthy();
    expect(screen.getByText('Cayma Hakkı')).toBeTruthy();
    expect(screen.getByText(/8\.1\. Cayma Hakkı Süresi/)).toBeTruthy();
  });

  it('opens the matching full contract when preview boxes are pressed', () => {
    const onOpenDistanceSales = jest.fn();
    const onOpenPreInfo = jest.fn();
    renderWithTamagui(
      <ContractPreviewContent
        onOpenDistanceSales={onOpenDistanceSales}
        onOpenPreInfo={onOpenPreInfo}
      />,
    );

    fireEvent.press(screen.getByLabelText('Ön Bilgilendirme Formu'));
    expect(onOpenPreInfo).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText('Cayma Hakkı'));
    expect(onOpenDistanceSales).toHaveBeenCalledTimes(1);
  });
});

describe('AgreementConsentCard', () => {
  it('renders the compact frontend-style agreement copy', () => {
    renderWithTamagui(
      <AgreementConsentCard
        checked={false}
        onChange={jest.fn()}
        onOpenDistanceSales={jest.fn()}
        onOpenPreInfo={jest.fn()}
      />,
    );

    expect(screen.getByText('Ön Bilgilendirme Koşulları')).toBeTruthy();
    expect(screen.getByText('Mesafeli Satış Sözleşmesi')).toBeTruthy();
    expect(screen.getByText(/okudum, onaylıyorum/)).toBeTruthy();
  });

  it('toggles agreement approval when the checkbox is pressed', () => {
    const onChange = jest.fn();
    renderWithTamagui(
      <AgreementConsentCard
        checked={false}
        onChange={onChange}
        onOpenDistanceSales={jest.fn()}
        onOpenPreInfo={jest.fn()}
      />,
    );

    fireEvent.press(
      screen.getByLabelText(
        'Ön bilgilendirme koşullarını ve mesafeli satış sözleşmesini onaylıyorum',
      ),
    );

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('opens the matching contract from the inline contract names', () => {
    const onOpenDistanceSales = jest.fn();
    const onOpenPreInfo = jest.fn();
    renderWithTamagui(
      <AgreementConsentCard
        checked={false}
        onChange={jest.fn()}
        onOpenDistanceSales={onOpenDistanceSales}
        onOpenPreInfo={onOpenPreInfo}
      />,
    );

    fireEvent.press(screen.getByText('Ön Bilgilendirme Koşulları'));
    expect(onOpenPreInfo).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Mesafeli Satış Sözleşmesi'));
    expect(onOpenDistanceSales).toHaveBeenCalledTimes(1);
  });
});
