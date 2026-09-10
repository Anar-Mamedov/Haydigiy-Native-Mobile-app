/* eslint-disable @typescript-eslint/no-require-imports */
import { NativeModules, Platform } from 'react-native';
import { isInsiderNativeSdkAvailable } from './insider-client';
import { InsiderPayload, InsiderProductSdk, InsiderSdk } from '../types/insider.types';
import { InsiderProductInput } from '../utils/insider-product.mapper';
import { INSIDER_CURRENCY, INSIDER_LOCALE } from '../utils/insider-locale';
import {
  InsiderRecommendationRequestLog,
  describeInsiderRecommendationResponse,
  describeInsiderRecommendationSkip,
  logInsiderRecommendationPayload,
} from '../utils/insider-recommendation-diagnostics';
import {
  EMPTY_INSIDER_RECOMMENDATION,
  InsiderRecommendation,
  mapInsiderRecommendation,
} from '../utils/insider-recommendation.mapper';

/** SDK bu metoda gönderilen kimliklerin ilk üçünü kullanır, fazlasını yok sayar. */
export const MAX_RECOMMENDATION_PRODUCT_IDS = 3;

/**
 * Callback hiç tetiklenmezse (ağ yok, native taraf yanıt vermiyor) promise asla
 * çözülmez ve ekran sonsuza kadar yükleniyor kalır. Bu süre sonunda boş sonuca düşeriz.
 */
export const RECOMMENDATION_TIMEOUT_MS = 10_000;

export interface InsiderRecommender {
  /** Ürün gerektirmeyen algoritmalar (çok satanlar, trendler, yeni gelenler, kullanıcı bazlı). */
  fetchRecommendation(recommendationId: number): Promise<InsiderRecommendation>;
  /** Ürün bazlı algoritmalar (birlikte alınanlar, birlikte görüntülenenler, benzerler). */
  fetchRecommendationForProduct(
    recommendationId: number,
    product: InsiderProductInput,
  ): Promise<InsiderRecommendation>;
  /** Kimlik bazlı algoritmalar; en fazla üç ürün kimliği gönderilir. */
  fetchRecommendationForProductIds(
    recommendationId: number,
    productIds: string[],
  ): Promise<InsiderRecommendation>;
}

interface InsiderRecommenderDependencies {
  isNativeSdkAvailable: () => boolean;
  loadSdk: () => InsiderSdk;
  onError: (message: string, error: unknown) => void;
  /** Teşhis kanalı: boş sonucun nedenini ayırt eden, PII taşımayan tek satırlık log. */
  onDiagnostic: (message: string) => void;
  /** Ham istek + yanıt; yalnızca geliştirme modunda yazılır. */
  onRawPayload: (entry: InsiderRecommendationRequestLog) => void;
  timeoutMs: number;
}

const defaultDependencies: InsiderRecommenderDependencies = {
  isNativeSdkAvailable: () => isInsiderNativeSdkAvailable(Platform.OS, NativeModules),
  loadSdk: () => require('react-native-insider').default as InsiderSdk,
  onError: (message, error) => console.warn(message, error),
  onDiagnostic: (message) => console.info(message),
  onRawPayload: (entry) => logInsiderRecommendationPayload(entry),
  timeoutMs: RECOMMENDATION_TIMEOUT_MS,
};

export function createInsiderRecommender(
  dependencies: InsiderRecommenderDependencies = defaultDependencies,
): InsiderRecommender {
  let sdk: InsiderSdk | null = null;

  const getSdk = (): InsiderSdk | null => {
    if (sdk) return sdk;
    if (!dependencies.isNativeSdkAvailable()) return null;
    sdk = dependencies.loadSdk();
    return sdk;
  };

  /**
   * SDK'nın callback tabanlı API'sini promise'e çevirir. Öneri alanı asla uygulama
   * akışını kırmamalı: SDK yoksa, hata çıkarsa ya da callback zamanında gelmezse
   * boş sonuç döner. Callback birden fazla kez tetiklenirse ilki geçerlidir.
   */
  const request = (
    options: {
      recommendationId: number;
      /** Hata mesajlarında kullanılan Türkçe etiket. */
      label: string;
      /** Çağrılan SDK metodunun adı; ham yanıt log'unda görünür. */
      method: string;
      /** SDK'ya gönderilen parametrelerin log'lanabilir özeti. */
      params: Record<string, unknown>;
    },
    invoke: (activeSdk: InsiderSdk, callback: (payload: InsiderPayload) => void) => void,
  ): Promise<InsiderRecommendation> =>
    new Promise((resolve) => {
      const { label, method, params, recommendationId } = options;
      const activeSdk = getSdk();
      if (!activeSdk) {
        dependencies.onDiagnostic(
          describeInsiderRecommendationSkip(recommendationId, 'native SDK yok'),
        );
        resolve(EMPTY_INSIDER_RECOMMENDATION);
        return;
      }

      let settled = false;
      const settle = (recommendation: InsiderRecommendation) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve(recommendation);
      };

      const timeoutId = setTimeout(() => {
        dependencies.onError(
          `[Insider] ${label} zaman aşımına uğradı · kampanya=${recommendationId}.`,
          null,
        );
        settle(EMPTY_INSIDER_RECOMMENDATION);
      }, dependencies.timeoutMs);

      try {
        invoke(activeSdk, (payload) => {
          // Mükerrer callback'te ilk yanıt geçerli; teşhis log'u da bir kez yazılmalı.
          if (settled) return;
          const recommendation = mapInsiderRecommendation(payload, INSIDER_CURRENCY);
          dependencies.onRawPayload({ method, params, payload, recommendationId });
          dependencies.onDiagnostic(
            describeInsiderRecommendationResponse(recommendationId, payload, recommendation),
          );
          settle(recommendation);
        });
      } catch (error) {
        dependencies.onError(
          `[Insider] ${label} alınamadı · kampanya=${recommendationId}.`,
          error,
        );
        settle(EMPTY_INSIDER_RECOMMENDATION);
      }
    });

  const buildProduct = (activeSdk: InsiderSdk, input: InsiderProductInput): InsiderProductSdk => {
    const product = activeSdk.createNewProduct(
      input.id,
      input.name,
      input.taxonomy,
      input.imageUrl,
      input.price,
      input.currency,
    );
    // Stok, Smart Recommender'ın ön koşulu olarak ürün objesinde bulunmalı.
    if (typeof input.stock === 'number' && input.stock >= 0) product.setStock(input.stock);
    if (typeof input.salePrice === 'number') product.setSalePrice(input.salePrice);
    if (input.brand) product.setBrand(input.brand);
    if (input.productUrl) product.setProductURL(input.productUrl);
    return product;
  };

  return {
    fetchRecommendation(recommendationId) {
      return request(
        {
          label: 'öneri listesi',
          method: 'getSmartRecommendation',
          params: { locale: INSIDER_LOCALE, currency: INSIDER_CURRENCY },
          recommendationId,
        },
        (activeSdk, callback) => {
          activeSdk.getSmartRecommendation(
            recommendationId,
            INSIDER_LOCALE,
            INSIDER_CURRENCY,
            callback,
          );
        },
      );
    },

    fetchRecommendationForProduct(recommendationId, product) {
      return request(
        {
          label: 'ürün bazlı öneri',
          method: 'getSmartRecommendationWithProduct',
          // Ürün nesnesi SDK handle'ı olduğu için log'a kimlik/ad özeti yazılır.
          params: { locale: INSIDER_LOCALE, product: { id: product.id, name: product.name } },
          recommendationId,
        },
        (activeSdk, callback) => {
          // Dikkat: bu metot currency almıyor (SDK imzası), fazladan parametre çağrıyı düşürür.
          activeSdk.getSmartRecommendationWithProduct(
            buildProduct(activeSdk, product),
            recommendationId,
            INSIDER_LOCALE,
            callback,
          );
        },
      );
    },

    fetchRecommendationForProductIds(recommendationId, productIds) {
      const cleaned = productIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id))
        .slice(0, MAX_RECOMMENDATION_PRODUCT_IDS);

      if (cleaned.length === 0) {
        dependencies.onDiagnostic(
          describeInsiderRecommendationSkip(recommendationId, 'geçerli ürün kimliği yok'),
        );
        return Promise.resolve(EMPTY_INSIDER_RECOMMENDATION);
      }

      return request(
        {
          label: 'kimlik bazlı öneri',
          method: 'getSmartRecommendationWithProductIDs',
          params: {
            locale: INSIDER_LOCALE,
            currency: INSIDER_CURRENCY,
            productIDs: cleaned,
          },
          recommendationId,
        },
        (activeSdk, callback) => {
          activeSdk.getSmartRecommendationWithProductIDs(
            cleaned,
            recommendationId,
            INSIDER_LOCALE,
            INSIDER_CURRENCY,
            callback,
          );
        },
      );
    },
  };
}

export const insiderRecommender = createInsiderRecommender();
