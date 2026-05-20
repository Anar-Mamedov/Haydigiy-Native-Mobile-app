import axios from 'axios';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { clearAccessToken, getAccessToken } from '@/lib/storage/secure-storage';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (!config.baseURL) {
    config.baseURL = getRequiredApiBaseUrl();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearAccessToken();
    }

    return Promise.reject(error);
  },
);
