import { OrderCargoMovementDto, OrderCargoTrackingDataDto } from './order-tracking.dtos';
import {
  OrderCargoMovement,
  OrderCargoTracking,
  OrderCargoTrackingStageKey,
} from '@/types/order.types';

const TIMELINE_STAGES: { key: OrderCargoTrackingStageKey; label: string }[] = [
  { key: 'handed', label: 'Kargoya Verildi' },
  { key: 'transfer', label: 'Transfer sürecinde' },
  { key: 'branch', label: 'Teslimat Şubesinde' },
  { key: 'courier', label: 'Kurye Dağıtımda' },
  { key: 'done', label: 'Tamamlandı' },
];

const HEPSIJET_CODE_MAP: Record<string, OrderCargoTrackingStageKey> = {
  COLLECTED: 'handed',
  TRANSFERRING_COLLECT: 'transfer',
  READY: 'transfer',
  WAITING_FOR_DISPATCH: 'branch',
  DELIVERING: 'courier',
  DELIVERED: 'done',
};

const PTT_CODE_MAP: Record<string, OrderCargoTrackingStageKey> = {
  KABUL: 'handed',
  TESLIM: 'done',
};

const DELIVERED_CODES = new Set(['DELIVERED', 'TESLIM']);
type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): RawRecord | null {
  return isRecord(value) ? value : null;
}

function stringifyValue(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return String(value);
  if (isRecord(value)) {
    return firstString(value.name, value.label, value.description, value.status);
  }
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const parsed = stringifyValue(value);
    if (parsed) return parsed;
  }
  return null;
}

function normalizeSearchText(...values: unknown[]): string {
  return values
    .map((value) => stringifyValue(value) ?? '')
    .join(' ')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

function valuesAsArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) return Object.values(value);
  return [];
}

function getNestedValue(record: RawRecord | null, keys: string[]): unknown {
  let current: unknown = record;
  for (const key of keys) {
    current = asRecord(current)?.[key];
  }
  return current;
}

function getRawResponse(root: RawRecord, nestedData: RawRecord | null): RawRecord | null {
  return (
    asRecord(root.raw_response) ??
    asRecord(nestedData?.raw_response) ??
    asRecord(root.rawResponse) ??
    asRecord(nestedData?.rawResponse)
  );
}

function getQueryResultCollection(...records: (RawRecord | null)[]): unknown[] {
  for (const record of records) {
    const collection =
      getNestedValue(record, ['data', 'QueryResult', 'Collection']) ??
      getNestedValue(record, ['QueryResult', 'Collection']) ??
      record?.Collection;
    const items = valuesAsArray(collection);
    if (items.length > 0) return items;
  }
  return [];
}

function getMovementRecords(root: RawRecord, nestedData: RawRecord | null, rawResponse: RawRecord | null): RawRecord[] {
  const candidates = [
    root.cargo_movements,
    nestedData?.cargo_movements,
    root.movements,
    nestedData?.movements,
    root.transactions,
    nestedData?.transactions,
    root.hareketler,
    nestedData?.hareketler,
    getQueryResultCollection(root, nestedData, rawResponse),
  ];

  for (const candidate of candidates) {
    const records = valuesAsArray(candidate).flatMap((item) => (isRecord(item) ? [item] : []));
    if (records.length > 0) return records;
  }

  return [];
}

function readMovementCode(dto: RawRecord): string | null {
  return firstString(
    dto.movement_code,
    dto.code,
    dto.movementCode,
    dto.status_code,
    dto.statusCode,
    dto.transactionCode,
    dto.operationStatusCode,
    dto.DURUM_KODU,
    dto.ISLEM_KODU,
    dto.KARGO_STATU,
  );
}

function readMovementDescription(dto: RawRecord): string | null {
  const raw = asRecord(dto.raw_response) ?? asRecord(dto.rawResponse);
  return firstString(
    dto.movement_description,
    dto.description,
    dto.transaction,
    dto.lastTransaction,
    dto.deliveryStatus,
    dto.operationStatus,
    dto.status,
    dto.statusName,
    dto.islem,
    dto.ISLEM,
    dto.HAREKET,
    dto.HAREKET_ADI,
    dto.DURUM,
    dto.KARGO_DURUMU,
    dto.KARGO_STATU,
    raw?.KARGO_DURUMU,
    raw?.DURUM,
    raw?.KARGO_STATU,
  );
}

function readMovementLocation(dto: RawRecord): string | null {
  const raw = asRecord(dto.raw_response) ?? asRecord(dto.rawResponse);
  return firstString(
    dto.movement_location,
    dto.location,
    dto.currentLocation,
    dto.current_location,
    dto.isyeri,
    dto.ISYERI,
    dto.branch,
    dto.branchName,
    dto.city,
    dto.cityName,
    dto.IL,
    dto.VARIS_IL,
    dto.ALICI_IL,
    dto.VARIS_SUBE,
    dto.VARIS_SUBESI,
    dto.TESLIMAT_SUBESI,
    raw?.VARIS_IL,
    raw?.ALICI_IL,
    raw?.VARIS_SUBE,
    raw?.VARIS_SUBESI,
    raw?.TESLIMAT_SUBESI,
  );
}

function readMovementDatetime(dto: RawRecord): string | null {
  const date = firstString(dto.movement_date, dto.date, dto.tarih, dto.TARIH, dto.HAREKET_TARIHI);
  const time = firstString(dto.saat, dto.SAAT, dto.time, dto.TIME);
  return firstString(
    dto.movement_datetime,
    dto.transactionDateTime,
    dto.dateTime,
    dto.datetime,
    dto.created_at,
    dto.createdAt,
    dto.TARIH_SAAT,
    dto.ISLEM_TARIHI,
    time && date ? `${date} ${time}` : null,
    date,
  );
}

function matchCargoStage(code?: string | null, description?: string | null): OrderCargoTrackingStageKey | null {
  const normalizedCode = (code ?? '').toUpperCase();
  const mappedCode = HEPSIJET_CODE_MAP[normalizedCode] ?? PTT_CODE_MAP[normalizedCode];
  if (mappedCode) return mappedCode;

  const text = normalizeSearchText(code, description);
  if (/(?:aliciya|muhataba|musteriye)\s*(?:bizzat\s*)?teslim|kargomatik(?:ten)?\s*teslim\s*alindi|teslim edildi|tamamlandi/.test(text)) {
    return 'done';
  }
  if (/dagiticiya verildi|dagitima cikti|dagitimda|kurye|teslimata cikarildi|mobil arac/.test(text)) {
    return 'courier';
  }
  if (/ptt isyerinde|teslimat birimine ulasti|teslimat sube|varis sube|subesinde|subede|depodan|depoda|bekliyor/.test(text)) {
    return 'branch';
  }
  if (/torbaya|sevk edildi|gelis kaydi|zimmet|transfer|aktarma|yolda|hat araci|guzergah|cikis subesi/.test(text)) {
    return 'transfer';
  }
  if (/kabul edildi|gonderi alindi|kayit edildi|kargo alindi|kargoya verildi|teslim alindi/.test(text)) {
    return 'handed';
  }
  return null;
}

function isDeliveredMovement(code?: string | null, description?: string | null): boolean {
  const normalizedCode = (code ?? '').toUpperCase();
  if (DELIVERED_CODES.has(normalizedCode)) return true;

  const text = normalizeSearchText(code, description);
  if (/(?:aliciya|muhataba|musteriye)\s*(?:bizzat\s*)?teslim/.test(text)) return true;
  if (/teslim edildi|tamamlandi/.test(text)) return true;
  if (/kargomatik(?:ten)?\s*teslim\s*alindi/.test(text)) return true;
  return false;
}

function formatCargoMovementDate(dto: OrderCargoMovementDto): string {
  const source = readMovementDatetime(dto);
  if (!source) return '-';

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return source;

  if (readMovementDatetime(dto) !== firstString(dto.movement_date, dto.date, dto.tarih, dto.TARIH)) {
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusName(order: OrderCargoTrackingDataDto['order']): string | null {
  if (!order || typeof order !== 'object' || !('status' in order)) return null;
  const value = order.status;
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.name ?? null;
}

function mapCargoMovement(dto: OrderCargoMovementDto, index: number): OrderCargoMovement {
  const code = readMovementCode(dto);
  const description = readMovementDescription(dto);
  const location = readMovementLocation(dto);
  const stageKey = matchCargoStage(code, description);
  return {
    id: dto.id ?? `movement-${index}`,
    code,
    description,
    location,
    dateLabel: formatCargoMovementDate(dto),
    delivered: isDeliveredMovement(code, description),
    stageKey,
  };
}

function getOrderRecord(root: RawRecord, nestedData: RawRecord | null): RawRecord | null {
  return asRecord(root.order) ?? asRecord(nestedData?.order);
}

function getCargoCompanyName(order: RawRecord | null, root: RawRecord, nestedData: RawRecord | null): string | null {
  return firstString(
    asRecord(order?.cargo_company)?.name,
    order?.cargo_company,
    root.cargo_company_name,
    nestedData?.cargo_company_name,
    root.cargoCompanyName,
    nestedData?.cargoCompanyName,
  );
}

function getCargoStatus(root: RawRecord, nestedData: RawRecord | null, rawResponse: RawRecord | null): string | null {
  return firstString(
    root.cargo_status,
    nestedData?.cargo_status,
    root.status,
    nestedData?.status,
    root.deliveryStatus,
    nestedData?.deliveryStatus,
    root.operationStatus,
    nestedData?.operationStatus,
    rawResponse?.durum,
    rawResponse?.DURUM,
    rawResponse?.KARGO_DURUMU,
    rawResponse?.KARGO_STATU,
  );
}

function getTrackingCode(order: RawRecord | null, root: RawRecord, nestedData: RawRecord | null, movements: RawRecord[], rawResponse: RawRecord | null): string | null {
  const firstMovementRaw = asRecord(movements[0]?.raw_response) ?? asRecord(movements[0]?.rawResponse);
  return firstString(
    order?.tracking_code,
    order?.trackingCode,
    root.tracking_code,
    nestedData?.tracking_code,
    root.trackingCode,
    nestedData?.trackingCode,
    rawResponse?.KARGO_TAKIP_NO,
    rawResponse?.tracking_code,
    firstMovementRaw?.KARGO_TAKIP_NO,
    firstMovementRaw?.tracking_code,
  );
}

function buildFallbackMovement(cargoStatus: string | null, root: RawRecord, nestedData: RawRecord | null, rawResponse: RawRecord | null): OrderCargoMovementDto | null {
  const location = firstString(
    root.movement_location,
    nestedData?.movement_location,
    root.currentLocation,
    nestedData?.currentLocation,
    rawResponse?.VARIS_IL,
    rawResponse?.ALICI_IL,
    rawResponse?.VARIS_SUBE,
    rawResponse?.VARIS_SUBESI,
    rawResponse?.TESLIMAT_SUBESI,
  );
  const description = firstString(cargoStatus, root.movement_description, nestedData?.movement_description);
  if (!description && !location) return null;
  return {
    movement_description: description,
    movement_location: location,
  };
}

export function formatTrackingCode(code: string): string {
  const normalized = code.replace(/\s/g, '');
  if (normalized.length <= 4) return normalized;

  const parts: string[] = [];
  for (let i = 0; i < normalized.length; i += 4) {
    parts.push(normalized.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function mapOrderCargoTracking(dto: OrderCargoTrackingDataDto): OrderCargoTracking {
  const root = dto as RawRecord;
  const nestedData = asRecord(root.data);
  const rawResponse = getRawResponse(root, nestedData);
  const order = getOrderRecord(root, nestedData);
  const cargoStatus = getCargoStatus(root, nestedData, rawResponse);
  const movementRecords = getMovementRecords(root, nestedData, rawResponse);
  const fallbackMovement =
    movementRecords.length === 0 ? buildFallbackMovement(cargoStatus, root, nestedData, rawResponse) : null;
  const movements = (fallbackMovement ? [fallbackMovement] : movementRecords).map(mapCargoMovement);
  const statusName = getStatusName(order as OrderCargoTrackingDataDto['order']);
  const statusStage = matchCargoStage(null, [cargoStatus, statusName].filter(Boolean).join(' '));
  const delivered =
    movements.some((movement) => movement.delivered) ||
    isDeliveredMovement(null, [cargoStatus, statusName].filter(Boolean).join(' '));
  const completedStageKeys = new Set(
    [
      ...movements.flatMap((movement) => (movement.stageKey ? [movement.stageKey] : [])),
      ...(statusStage ? [statusStage] : []),
    ],
  );
  const stageOrder = TIMELINE_STAGES.map((stage) => stage.key);

  let lastDoneIndex = -1;
  if (delivered) {
    lastDoneIndex = stageOrder.length - 1;
  } else {
    for (let index = stageOrder.length - 1; index >= 0; index -= 1) {
      if (completedStageKeys.has(stageOrder[index])) {
        lastDoneIndex = index;
        break;
      }
    }
  }
  if (lastDoneIndex < 0 && (movements.length > 0 || cargoStatus)) {
    lastDoneIndex = 0;
  }

  return {
    orderNo: firstString(order?.order_no, order?.orderNo, root.order_no, nestedData?.order_no),
    trackingCode: getTrackingCode(order, root, nestedData, movementRecords, rawResponse),
    statusName,
    cargoCompanyName: getCargoCompanyName(order, root, nestedData),
    cargoStatus,
    stages: TIMELINE_STAGES.map((stage, index) => ({
      ...stage,
      completed: index <= lastDoneIndex,
    })),
    movements,
    lastMovement: movements[0] ?? null,
    delivered,
  };
}
