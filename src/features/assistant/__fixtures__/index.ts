/**
 * Backend teslim paketindeki (Haydi Asistan 1.1) gerçek API kayıtları. Paket güncellenince bu klasördeki
 * JSON dosyaları yenisiyle değiştirilir; testler burada listelenen akışların hepsini dolaşır.
 */
import answerWithVideo from './answer-with-video.json';
import categoryTopic from './category-topic.json';
import config from './config.json';
import dynamicMenu from './dynamic-menu.json';
import errors from './errors.json';
import guestMenuNavigation from './guest-menu-navigation.json';
import guestOrdersLogin from './guest-orders-login.json';
import helpArticleTopic from './help-article-topic.json';
import historyEventLogout from './history-event-logout.json';
import memberOrders from './member-orders.json';
import memberReturnsCancel from './member-returns-cancel.json';
import typedAi from './typed-ai.json';
import typedRules from './typed-rules.json';
import urlContract from './url-contract.json';

export interface AssistantFixtureStep {
  request: { method: string; path: string; body?: Record<string, unknown> };
  response: { status: number; body: Record<string, any> | null };
}

export interface AssistantFixtureFlow {
  flow: string;
  steps: AssistantFixtureStep[];
}

export const ASSISTANT_FIXTURE_FLOWS: Record<string, AssistantFixtureFlow> = {
  'answer-with-video': answerWithVideo as AssistantFixtureFlow,
  'category-topic': categoryTopic as AssistantFixtureFlow,
  config: config as AssistantFixtureFlow,
  'dynamic-menu': dynamicMenu as AssistantFixtureFlow,
  errors: errors as AssistantFixtureFlow,
  'guest-menu-navigation': guestMenuNavigation as AssistantFixtureFlow,
  'guest-orders-login': guestOrdersLogin as AssistantFixtureFlow,
  'help-article-topic': helpArticleTopic as AssistantFixtureFlow,
  'history-event-logout': historyEventLogout as AssistantFixtureFlow,
  'member-orders': memberOrders as AssistantFixtureFlow,
  'member-returns-cancel': memberReturnsCancel as AssistantFixtureFlow,
  'typed-ai': typedAi as AssistantFixtureFlow,
  'typed-rules': typedRules as AssistantFixtureFlow,
};

export const ASSISTANT_URL_CONTRACT = urlContract as {
  links: Record<string, { desktop: string; mobile: string }>;
  parameterized: Record<string, { desktop: string; mobile: string }>;
  rejected: string[];
};
