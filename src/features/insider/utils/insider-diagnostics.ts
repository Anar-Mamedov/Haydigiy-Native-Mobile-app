import { InsiderCallbackType, InsiderPayload } from '../types/insider.types';

/**
 * InApp teşhis günlüğü.
 *
 * "InApp görünmüyor" şikâyeti iki bambaşka nedenden gelebilir ve dışarıdan
 * ikisi aynı görünür:
 *
 * 1. InApp cihaza hiç ulaşmıyor (kampanya yayında değil, hedef kitle tutmuyor,
 *    tetikleyici event eşleşmiyor) → SDK hiçbir callback yayınlamaz.
 * 2. InApp cihaza ulaşıyor ama ekrana çizilemiyor → SDK `INAPP_SEEN` yayınlar.
 *
 * SDK bu ayrımı yalnızca callback üzerinden veriyor; uygulama şimdiye kadar
 * yönlendirme taşımayan tipleri sessizce atıyordu, dolayısıyla hiçbir iz
 * kalmıyordu. Bu modül InApp yaşam döngüsünü tek satırlık, PII içermeyen
 * loglara çevirir; Test Lab / cihaz log'unda iki senaryo ayırt edilebilir hale
 * gelir.
 *
 * ÖNEMLİ: `INAPP_SEEN` tek başına "gösterildi" demek DEĞİLDİR. Insider'ın Block
 * InApps dokümanına göre InApp gösterim anında engellenmişse de `inapp_seen`
 * gönderilir ve bu durum `dismiss_type: 9` parametresiyle işaretlenir. Bu yüzden
 * `dismiss_type` değeri log'a yazılır — "engellendi" ile "gerçekten gösterildi"
 * ancak bu değerle ayrılabilir.
 *
 * @see https://academy.insiderone.com/docs/block-inapps
 * @see https://academy.insiderone.com/docs/block-inapps-1
 */

/** InApp'in gösterim anında engellendiğini bildiren `dismiss_type` değeri. */
export const BLOCKED_DISMISS_TYPE = 9;

/**
 * Değeri log'a yazılabilecek alanlar. Hepsi kampanya kimliği ya da enum;
 * kişisel veri taşımazlar. Listede olmayan alanların yalnızca adı yazılır.
 */
const SAFE_VALUE_KEYS = ['dismiss_type', 'ins_camp_id', 'ins_variant_id'] as const;

/** Yalnızca InApp yaşam döngüsünü ilgilendiren tipler loglanır. */
const OBSERVED_TYPES = new Map<number, string>([
  [InsiderCallbackType.SESSION_STARTED, 'session başladı'],
  [InsiderCallbackType.INAPP_SEEN, 'InApp gösterildi (INAPP_SEEN)'],
  [InsiderCallbackType.INAPP_BUTTON_CLICK, 'InApp butonuna tıklandı'],
]);

export interface InsiderDiagnosticsSink {
  log: (message: string) => void;
}

const defaultSink: InsiderDiagnosticsSink = {
  log: (message) => console.info(message),
};

/**
 * Payload'da kişisel veri taşınabileceği için gövde loglanmaz: yalnızca alan
 * adları, artı `SAFE_VALUE_KEYS` içindeki teşhis alanlarının değerleri yazılır.
 */
function describePayload(payload: InsiderPayload): string {
  const source = payload ?? {};
  const keys = Object.keys(source);
  if (keys.length === 0) return 'boş';

  return keys
    .sort()
    .map((key) =>
      (SAFE_VALUE_KEYS as readonly string[]).includes(key)
        ? `${key}=${String(source[key])}`
        : key,
    )
    .join(', ');
}

/** Insider gösterim anında engellenen InApp'i `dismiss_type: 9` ile bildirir. */
function wasBlocked(payload: InsiderPayload): boolean {
  return Number(payload?.dismiss_type) === BLOCKED_DISMISS_TYPE;
}

export function logInsiderCallback(
  type: number,
  payload: InsiderPayload,
  sink: InsiderDiagnosticsSink = defaultSink,
): void {
  const label = OBSERVED_TYPES.get(type);
  if (!label) return;

  const blocked =
    type === InsiderCallbackType.INAPP_SEEN && wasBlocked(payload)
      ? ' · ENGELLENDİ (dismiss_type=9)'
      : '';

  sink.log(
    `[Insider] ${label}${blocked} · tip=${type} · alanlar: ${describePayload(payload)}`,
  );
}
