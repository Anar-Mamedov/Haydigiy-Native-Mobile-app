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

  config.headers['X-Frontend-Key'] = 'hgk_8bX2Z-PQv9L0aj-YdTk14';

  return config;
});

// Axios isteğin gövdesini JSON string'e çevirir; logda obje olarak görünmesi için geri parse et
const parseRequestData = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

apiClient.interceptors.response.use(
  (response) => {
    // Geliştirme modunda istek + yanıtı TEK log'da birleştir
    if (__DEV__) {
      console.log(`🔵 API ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        params: response.config.params,
        request: parseRequestData(response.config.data),
        response: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Detaylı network error logging (Xiaomi/Oppo debug için)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error Details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
    }

    // Sunucudan dönen hata yanıtlarını (400 vb.) istek + yanıt birlikte TEK log'da göster
    if (error.response && error.response.status !== 401) {
      console.error(`🔴 API ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        params: error.config?.params,
        request: parseRequestData(error.config?.data),
        response: error.response.data,
      });
    }

    if (error.response && error.response.status === 401) {
      await clearAccessToken();
    }

    return Promise.reject(error);
  },
);
