import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { AssistantButtonsBlock as ButtonsBlock } from '@/types/assistant.types';
import { selectAssistantOption } from '../services/assistant-turn-flow';
import { useAssistantStore } from '../store/use-assistant-store';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';
import { AssistantBreadcrumb } from './assistant-breadcrumb';
import { AssistantButtonsBlock } from './blocks/assistant-buttons-block';
import { AssistantLiveSupport } from './blocks/assistant-live-support';
import { AssistantOrderList } from './blocks/assistant-order-blocks';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn().mockResolvedValue(true) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../services/assistant-turn-flow', () => ({
  selectAssistantOption: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../services/assistant-events', () => ({
  trackAssistantEvent: jest.fn(),
  trackAssistantClientError: jest.fn(),
}));

const block: ButtonsBlock = {
  type: 'buttons',
  id: 'b2',
  layout: 'list',
  items: [{ id: 'menu.orders', label: '📦 Siparişlerim', payload: 'p1', disabled: false }],
};

beforeEach(() => {
  jest.clearAllMocks();
  act(() => useAssistantStore.getState().resetConversation());
});

describe('AssistantButtonsBlock', () => {
  it('etiketi aynen basar ve id/payload ile seçim gönderir', () => {
    renderWithTamagui(<AssistantButtonsBlock block={block} restored={false} />);
    fireEvent.press(screen.getByLabelText('📦 Siparişlerim'));
    expect(selectAssistantOption).toHaveBeenCalledWith('menu.orders', 'p1', '📦 Siparişlerim');
  });

  // Web `0aae36636`: baştaki emoji ayrı simge kutusunda, metin yanında çizilir; ekran okuyucu tam etiketi duyar.
  it('baştaki emojiyi simge kutusuna alır, metni yanında gösterir', () => {
    renderWithTamagui(<AssistantButtonsBlock block={block} restored={false} />);
    expect(screen.getByText('📦')).toBeTruthy();
    expect(screen.getByText('Siparişlerim')).toBeTruthy();
    expect(screen.queryByText('📦 Siparişlerim')).toBeNull();
  });

  it('emojisiz etiketi ve çip düzenini olduğu gibi basar', () => {
    renderWithTamagui(
      <AssistantButtonsBlock
        block={{
          ...block,
          layout: 'chips',
          items: [{ id: 'yes', label: '👍 Evet', payload: 'p2', disabled: false }],
        }}
        restored={false}
      />,
    );
    expect(screen.getByText('👍 Evet')).toBeTruthy();
  });

  it('geri yüklenen geçmişte ve istek uçuştayken seçim göndermez', () => {
    const { rerender } = renderWithTamagui(<AssistantButtonsBlock block={block} restored />);
    fireEvent.press(screen.getByLabelText('📦 Siparişlerim'));
    act(() => useAssistantStore.getState().setBusy(true));
    rerender(<AssistantButtonsBlock block={block} restored={false} />);
    fireEvent.press(screen.getByLabelText('📦 Siparişlerim'));
    expect(selectAssistantOption).not.toHaveBeenCalled();
  });

  it('koyu temada da etiketi gösterir', () => {
    renderWithTamagui(<AssistantButtonsBlock block={block} restored={false} />, 'dark');
    expect(screen.getByText('Siparişlerim')).toBeTruthy();
    expect(screen.getByLabelText('📦 Siparişlerim')).toBeTruthy();
  });
});

describe('AssistantOrderList', () => {
  const orderList = {
    type: 'order_list' as const,
    id: 'orders',
    items: [
      {
        select_id: 'order.2',
        payload: 'p13',
        order_no: '#2',
        date_label: '20 Ekim 2026',
        total_label: '899,00 ₺',
        status_text: '📦 Kargoda',
        tone: 'info' as const,
        products: [{ name: 'Mavi Tunik', qty: 1, variant: 'M', unit_price_label: '449,50 ₺' }],
      },
      {
        select_id: 'order.3',
        payload: 'p14',
        order_no: '#3',
        date_label: '18 Ekim 2026',
        total_label: '199,90 ₺',
        status_text: '✅ Teslim edildi',
        tone: 'success' as const,
      },
    ],
  };

  it.each([undefined, 'dark'] as const)('kartın altında siparişin ürünlerini gösterir ve seçim gönderir (%s tema)', (theme) => {
    renderWithTamagui(<AssistantOrderList block={orderList} restored={false} />, theme);

    expect(screen.getAllByTestId('assistant-order-product')).toHaveLength(1);
    expect(screen.getByText('Mavi Tunik')).toBeTruthy();
    expect(screen.getByText('M · 1 adet')).toBeTruthy();

    fireEvent.press(screen.getByTestId('assistant-order-order.2'));
    expect(selectAssistantOption).toHaveBeenCalledWith('order.2', 'p13', '#2');
  });
});

describe('AssistantLiveSupport', () => {
  it('WhatsApp açar, ardından kalıcı yedek satırı gösterir ve mesajı kopyalar', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderWithTamagui(
      <AssistantLiveSupport
        copyText="Merhaba, Haydi Asistan üzerinden yazıyorum."
        href="https://wa.me/905327805100?text=Merhaba"
        label="💬 Canlı Destek"
        numberLabel="+90 532 780 51 00"
        texts={DEFAULT_ASSISTANT_TEXTS}
      />,
    );
    expect(screen.queryByTestId('assistant-live-backup')).toBeNull();
    // Baştaki emoji yerine WhatsApp simgesi çizilir; erişilebilirlik etiketi tamdır.
    expect(screen.getByText('Canlı Destek')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('💬 Canlı Destek'));
    expect(openURL).toHaveBeenCalledWith('https://wa.me/905327805100?text=Merhaba');
    expect(screen.getByTestId('assistant-live-backup')).toBeTruthy();
    fireEvent.press(screen.getByText(DEFAULT_ASSISTANT_TEXTS.live_copy_button));
    await waitFor(() =>
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Merhaba, Haydi Asistan üzerinden yazıyorum.'),
    );
    expect(await screen.findByText(DEFAULT_ASSISTANT_TEXTS.copied)).toBeTruthy();
  });
});

describe('AssistantBreadcrumb', () => {
  it('boşken çizilmez; önceki öğe seçim gönderir, bulunulan yer göndermez', () => {
    const { rerender } = renderWithTamagui(<AssistantBreadcrumb texts={DEFAULT_ASSISTANT_TEXTS} />);
    expect(screen.queryByTestId('assistant-breadcrumb')).toBeNull();
    act(() =>
      useAssistantStore.getState().setTurnState(null, [
        { label: '🏠 Ana menü', current: false, id: 'nav.home', payload: 'p16' },
        { label: 'Şifremi unuttum', current: true },
      ]),
    );
    rerender(<AssistantBreadcrumb texts={DEFAULT_ASSISTANT_TEXTS} />);
    fireEvent.press(screen.getByText('Şifremi unuttum'));
    expect(selectAssistantOption).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText('🏠 Ana menü'));
    expect(selectAssistantOption).toHaveBeenCalledWith('nav.home', 'p16', '🏠 Ana menü');
  });
});
