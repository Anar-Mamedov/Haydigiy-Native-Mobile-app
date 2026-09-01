import { Truck, CircleX, CircleCheck } from '@/components/ui/icons';
import {
  formatOrderDate,
  formatOrderPrice,
  formatOrderTimelineDate,
  formatReturnDeadline,
  getOrderStatusIcon,
  getOrderStatusText,
  PENDING_PAYMENT_STATUS_TEXT,
} from './order-status';

describe('formatOrderPrice', () => {
  it('keeps order and cancellation prices at two decimal places', () => {
    expect(formatOrderPrice(199)).toBe('199.00 TL');
    expect(formatOrderPrice('199.9')).toBe('199.90 TL');
  });

  it('falls back safely for missing or malformed prices', () => {
    expect(formatOrderPrice(null)).toBe('0.00 TL');
    expect(formatOrderPrice('geçersiz')).toBe('0.00 TL');
  });
});

describe('formatReturnDeadline', () => {
  it('adds 13 days to an ISO delivery date and formats DD.MM.YYYY', () => {
    expect(formatReturnDeadline('2026-06-18T10:00:00')).toBe('01.07.2026');
  });

  it('parses the Turkish "18 Haz 2026" label', () => {
    expect(formatReturnDeadline('18 Haz 2026 - 12:00')).toBe('01.07.2026');
  });

  it('returns null for empty or unparseable input', () => {
    expect(formatReturnDeadline('')).toBeNull();
    expect(formatReturnDeadline('belirsiz')).toBeNull();
  });
});

describe('getOrderStatusText', () => {
  it('returns the pending-payment text for "Taslak" orders', () => {
    expect(getOrderStatusText('Taslak')).toBe(PENDING_PAYMENT_STATUS_TEXT);
    expect(getOrderStatusText('  Taslak  ')).toBe(PENDING_PAYMENT_STATUS_TEXT);
  });

  it('passes through other statuses unchanged', () => {
    expect(getOrderStatusText('Teslim Edildi')).toBe('Teslim Edildi');
  });
});

describe('getOrderStatusIcon', () => {
  it('maps known statuses to their icon and defaults the rest', () => {
    expect(getOrderStatusIcon('Kargoya Verildi')).toBe(Truck);
    expect(getOrderStatusIcon('İptal Edildi')).toBe(CircleX);
    expect(getOrderStatusIcon('Bilinmeyen')).toBe(CircleCheck);
  });
});

describe('formatOrderDate', () => {
  it('keeps the date part before a " - " range', () => {
    expect(formatOrderDate('17 Haziran 2026 - 12:00')).toBe('17 Haziran 2026');
  });

  it('takes the date part of an ISO timestamp', () => {
    expect(formatOrderDate('2026-06-10T17:31:50.000000Z')).toBe('2026-06-10');
  });

  it('does not treat the T in a Turkish short month name as an ISO separator', () => {
    expect(formatOrderDate('10 Tem 2026')).toBe('10 Tem 2026');
  });

  it('returns "-" for an empty value', () => {
    expect(formatOrderDate('')).toBe('-');
  });
});

describe('formatOrderTimelineDate', () => {
  it('keeps frontend date-time labels intact for the order timeline', () => {
    expect(formatOrderTimelineDate('04 Tem 2026 - 16:09')).toBe('04 Tem 2026 - 16:09');
  });

  it('normalizes empty and ISO values for timeline display', () => {
    expect(formatOrderTimelineDate(null)).toBeNull();
    expect(formatOrderTimelineDate('2026-06-10T17:31:50.000000Z')).toBe('2026-06-10');
  });
});
