import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth.access-token';

export function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
