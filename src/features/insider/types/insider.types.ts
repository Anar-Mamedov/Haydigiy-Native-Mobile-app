export type InsiderPayload = Record<string, unknown>;

export type InsiderCallback = (type: number, payload: InsiderPayload) => void;

export interface InsiderSdk {
  init(
    partnerName: string,
    appGroup: string,
    callback: (type: number, payload: InsiderPayload) => void,
  ): void;
  registerWithQuietPermission(enabled: boolean): void;
  setActiveForegroundPushView(): void;
  handleUniversalLink(url: string): void;
  handleURL(url: string): void;
}

export interface InsiderClient {
  initialize(callback: InsiderCallback): boolean;
  clearCallback(callback: InsiderCallback): void;
  handleIncomingUrl(url: string): void;
}

export type InsiderPushAction =
  | { type: 'internal'; url: string }
  | { type: 'external'; url: string }
  | null;
