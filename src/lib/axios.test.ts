import { apiClient } from './axios';

type RejectedHandler = (error: unknown) => Promise<unknown>;

const SENSITIVE_BODY = JSON.stringify({ password: 'gizli-sifre', card_number: '4111111111111111', cvv: '123' });

// Interceptor __DEV__'i çağrı anında okur; release davranışı global bayrakla taklit edilir.
const setDev = (isDev: boolean) => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = isDev;
};

const getResponseErrorHandler = (): RejectedHandler => {
  const manager = apiClient.interceptors.response as unknown as { handlers: { rejected: RejectedHandler }[] };
  return manager.handlers[0].rejected;
};

const serverError = () => ({
  message: 'Request failed with status code 422',
  config: { method: 'post', url: '/payment-router', data: SENSITIVE_BODY },
  response: { status: 422, data: { message: 'Kart reddedildi' } },
});

describe('apiClient response error logging', () => {
  const originalDev = (globalThis as { __DEV__?: boolean }).__DEV__;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    setDev(originalDev ?? true);
  });

  it('never writes the request body (password, card number, CVV) to the log in release builds', async () => {
    setDev(false);
    const handler = getResponseErrorHandler();

    await expect(handler(serverError())).rejects.toBeDefined();

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('keeps the combined request + response log for developers', async () => {
    setDev(true);
    const handler = getResponseErrorHandler();

    await expect(handler(serverError())).rejects.toBeDefined();

    expect(consoleError).toHaveBeenCalledWith('🔴 API POST /payment-router', expect.objectContaining({ status: 422 }));
  });
});
