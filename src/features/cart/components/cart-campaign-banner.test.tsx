import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartCampaignBanner, CartCampaignBannerView } from './cart-campaign-banner';
import { CartCampaignBannerStatus } from '@/types/cart.types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

const mockBannerQuery = jest.fn();
jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCampaignBannerQuery: () => mockBannerQuery(),
}));

const STATUS: CartCampaignBannerStatus = {
  campaignName: 'Sepette 2.000 TL',
  currentAmount: 0,
  threshold: 2000,
  message: "Kampanyadan faydalanabilmek için sepetine 2.000 TL'lik daha ürün eklemelisin.",
  progress: 0,
};

describe('CartCampaignBannerView', () => {
  it('renders the campaign name, the progress amount and the message', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={STATUS} />);

    expect(screen.getByText('Sepette 2.000 TL')).toBeTruthy();
    expect(screen.getByText('0/2.000 TL')).toBeTruthy();
    expect(screen.getByText(STATUS.message)).toBeTruthy();
  });

  it('shows a single amount when the campaign has no threshold', () => {
    renderWithTamagui(
      <CartCampaignBannerView
        onGoToCart={jest.fn()}
        status={{ ...STATUS, currentAmount: 1250.5, threshold: null }}
      />,
    );

    expect(screen.getByText('1.250,5 TL')).toBeTruthy();
  });

  it('calls onGoToCart from the accessible call to action', () => {
    const onGoToCart = jest.fn();
    renderWithTamagui(<CartCampaignBannerView onGoToCart={onGoToCart} status={STATUS} />);

    fireEvent.press(screen.getByLabelText('Sepete git'));

    expect(onGoToCart).toHaveBeenCalledTimes(1);
  });

  it('keeps its labels readable after switching to the dark theme', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={STATUS} />, 'dark');

    expect(screen.getByText('Sepette 2.000 TL')).toBeTruthy();
    expect(screen.getByText('0/2.000 TL')).toBeTruthy();
    expect(screen.getByLabelText('Sepete git')).toBeTruthy();
  });
});

describe('CartCampaignBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the cart screen when the call to action is pressed', () => {
    mockBannerQuery.mockReturnValue({ data: STATUS });
    renderWithTamagui(<CartCampaignBanner />);

    fireEvent.press(screen.getByLabelText('Sepete git'));

    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('renders nothing while there is no campaign to show', () => {
    mockBannerQuery.mockReturnValue({ data: null });
    renderWithTamagui(<CartCampaignBanner />);

    expect(screen.queryByTestId('cart-campaign-banner')).toBeNull();
  });

  it('renders nothing while the campaign request is still pending or failed', () => {
    mockBannerQuery.mockReturnValue({ data: undefined });
    renderWithTamagui(<CartCampaignBanner />);

    expect(screen.queryByTestId('cart-campaign-banner')).toBeNull();
  });
});
