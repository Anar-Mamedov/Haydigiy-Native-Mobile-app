import { Truck, CircleX, CircleCheck } from '@tamagui/lucide-icons-2';
import {
  formatOrderDate,
  formatReturnDeadline,
  getOrderStatusIcon,
  getOrderStatusText,
  PENDING_PAYMENT_STATUS_TEXT,
} from './order-status';

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

  it('returns "-" for an empty value', () => {
    expect(formatOrderDate('')).toBe('-');
  });
});
