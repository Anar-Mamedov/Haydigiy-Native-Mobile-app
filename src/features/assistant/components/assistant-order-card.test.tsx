import { act, fireEvent, screen } from '@testing-library/react-native';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { AssistantOrderCardBlock } from '@/types/assistant.types';
import { trackAssistantEvent } from '../services/assistant-events';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';
import { AssistantOrderCard } from './blocks/assistant-order-blocks';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('../services/assistant-events', () => ({
  trackAssistantEvent: jest.fn(),
  trackAssistantClientError: jest.fn(),
}));

const card: AssistantOrderCardBlock = {
  type: 'order_card',
  id: 'c1',
  order_no: '#2',
  date_label: '20 Ekim 2026',
  total_label: '499,90 TL',
  status_text: '📦 Kargoda',
  tone: 'info',
  lines: [],
  items: [],
};

const detail = {
  label: 'Sipariş sayfasını aç',
  href: {
    desktop: '/giris?returnUrl=%2Fhesabim%2Fsiparislerim%2F2%3Fsrc%3Dhaydi-asistan',
    mobile: '/giris?returnUrl=%2Fm%2Fhesabim%2Fsiparislerim%2F2%3Fsrc%3Dhaydi-asistan',
  },
};

const renderCard = (block: AssistantOrderCardBlock, theme?: 'dark') =>
  renderWithTamagui(<AssistantOrderCard block={block} texts={DEFAULT_ASSISTANT_TEXTS} />, theme);

beforeEach(() => {
  jest.clearAllMocks();
  act(() => useAuthStore.setState({ user: null }));
});

describe('AssistantOrderCard detail bağlantısı', () => {
  it('detail yoksa bağlantı çizilmez', () => {
    renderCard(card);
    expect(screen.queryByTestId('assistant-order-detail-c1')).toBeNull();
  });

  it("etiketi aynen basar; dokununca kartın id'siyle link_click atar ve sipariş ekranını açar", () => {
    act(() => useAuthStore.setState({ user: { id: '8', email: 'a@example.com', name: 'Anar' } }));
    renderCard({ ...card, detail });

    fireEvent.press(screen.getByText('#2'));
    expect(trackAssistantEvent).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Sipariş sayfasını aç'));
    expect(trackAssistantEvent).toHaveBeenCalledWith(
      'link_click',
      { blockId: 'c1', kind: 'siparis' },
      { flushNow: true },
    );
    expect(mockPush).toHaveBeenCalledWith('/order/2?src=haydi-asistan');
  });

  it('misafir müşteri giriş formunun olduğu Hesabım ekranına gider', () => {
    renderCard({ ...card, detail });
    fireEvent.press(screen.getByLabelText('Sipariş sayfasını aç'));
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('koyu temada da etiketi gösterir', () => {
    renderCard({ ...card, detail }, 'dark');
    expect(screen.getByText('Sipariş sayfasını aç')).toBeTruthy();
  });
});
