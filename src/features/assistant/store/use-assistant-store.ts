import { create } from 'zustand';
import type {
  AssistantAuthLevel,
  AssistantBreadcrumbItem,
  AssistantConfig,
  AssistantInputState,
  AssistantMessage,
} from '@/types/assistant.types';

/**
 * Asistan oturumu (bellekte). Bilerek KALICI DEĞİL: webdeki "sekmeye özel sessionStorage" kuralının
 * uygulamadaki karşılığı uygulama sürecidir; uygulama kapanınca oturum biter, müşteri mesajı/siparişi
 * diske yazılmaz (README §2 kural 8, §3). Kısa ömürlü asistan token'ı yalnız burada, bellekte durur.
 */
export interface AssistantSession {
  token: string;
  sessionId: string;
  expiresAt: string;
  authLevel: AssistantAuthLevel;
  /**
   * Site token'ıyla açılıp yine de `guest` dönen oturum (geçersiz/süresi dolmuş site token'ı) tekrar
   * yükseltilmez; yoksa her turn öncesi yeni oturum açan bir döngü oluşur.
   */
  siteTokenSent: boolean;
}

interface AssistantState {
  config: AssistantConfig | null;
  /** 403 `assistant_disabled`: giriş noktaları kaybolur (kural 13). */
  disabled: boolean;
  session: AssistantSession | null;
  conversationReady: boolean;
  messages: AssistantMessage[];
  input: AssistantInputState;
  breadcrumb: AssistantBreadcrumbItem[];
  busy: boolean;
  lockedUntil: number;
  draft: string;

  setConfig: (config: AssistantConfig) => void;
  disable: () => void;
  setSession: (session: AssistantSession | null) => void;
  updateExpiry: (expiresAt: string) => void;
  setBusy: (busy: boolean) => void;
  setConversationReady: (ready: boolean) => void;
  appendMessages: (messages: AssistantMessage[]) => void;
  replaceMessages: (messages: AssistantMessage[]) => void;
  updateMessage: (key: string, patch: Partial<AssistantMessage>) => void;
  setTurnState: (input: AssistantInputState | null, breadcrumb: AssistantBreadcrumbItem[] | null) => void;
  lockInput: (seconds: number) => void;
  setDraft: (draft: string) => void;
  resetConversation: () => void;
}

const DEFAULT_INPUT: AssistantInputState = { mode: 'none', placeholder: '', maxlength: 500 };

const EMPTY_CONVERSATION = {
  session: null,
  conversationReady: false,
  messages: [],
  input: DEFAULT_INPUT,
  breadcrumb: [],
  busy: false,
  lockedUntil: 0,
  draft: '',
};

export const useAssistantStore = create<AssistantState>((set) => ({
  config: null,
  disabled: false,
  ...EMPTY_CONVERSATION,

  setConfig: (config) => set({ config }),
  disable: () => set({ disabled: true, ...EMPTY_CONVERSATION }),
  setSession: (session) => set({ session }),
  updateExpiry: (expiresAt) =>
    set((state) => (state.session && expiresAt ? { session: { ...state.session, expiresAt } } : state)),
  setBusy: (busy) => set({ busy }),
  setConversationReady: (ready) => set({ conversationReady: ready }),
  appendMessages: (messages) => set((state) => ({ messages: [...state.messages, ...messages] })),
  replaceMessages: (messages) => set({ messages }),
  updateMessage: (key, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.key === key ? ({ ...message, ...patch } as AssistantMessage) : message,
      ),
    })),
  setTurnState: (input, breadcrumb) =>
    set((state) => ({
      input: input ?? state.input,
      breadcrumb: breadcrumb ?? state.breadcrumb,
      draft: input?.mode === 'none' ? '' : state.draft,
    })),
  lockInput: (seconds) => set({ lockedUntil: Date.now() + seconds * 1000 }),
  setDraft: (draft) => set({ draft }),
  resetConversation: () => set({ ...EMPTY_CONVERSATION }),
}));

/** Süresi dolmamış oturum; dolmuşsa `null` (README §4.2: süre dolunca yeni oturum). */
export const getActiveAssistantSession = (): AssistantSession | null => {
  const session = useAssistantStore.getState().session;
  if (!session) return null;
  const expiresAt = Date.parse(session.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() ? session : null;
};
