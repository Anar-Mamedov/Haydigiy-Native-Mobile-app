import {
  buildHepsijetSendPayload,
  cancelHepsijetDelivery,
  getHepsijetAvailableDates,
  sendHepsijetDelivery,
} from './hepsijet.service';
import { recreateReturnAsPttDto } from './return.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
    delete: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;
const del = apiClient.delete as jest.Mock;

// Regression: Hepsijet/PTT'ye proxy'lenen çağrılar global 15 sn zaman aşımını
// aşabiliyor; istemci erken vazgeçince backend işlemi yine tamamlıyor ve ikinci
// deneme "Gönderi numarası sistemde kayıtlı" hatasına düşüyordu. Web istemcisi
// 60 sn beklediği için aynı akış webde sorunsuzdu.
describe('hepsijet gateway timeouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the pickup with the extended gateway timeout', async () => {
    const payload = buildHepsijetSendPayload({
      deliveryDate: '2026-07-06',
      customerOrderNo: 'HG-1',
      sender: { city: 'Niğde', town: 'Merkez', district: 'Kale', addressLine1: 'Adres' },
      receiver: { firstName: 'Anar', lastName: 'Mamedov', phone1: '05000000000' },
    });
    await sendHepsijetDelivery(payload);

    expect(post).toHaveBeenCalledWith(
      '/hepsijet/delivery/send',
      payload,
      expect.objectContaining({ timeout: 60000 }),
    );
  });

  it('cancels the pickup with the extended gateway timeout', async () => {
    await cancelHepsijetDelivery('HG-1-R');

    expect(del).toHaveBeenCalledWith(
      '/hepsijet/delivery/HG-1-R',
      expect.objectContaining({ timeout: 60000 }),
    );
  });

  it('fetches available dates with the extended gateway timeout', async () => {
    await getHepsijetAvailableDates({
      startDate: '2026-07-04',
      endDate: '2026-07-18',
      city: 'Niğde',
      town: 'Merkez',
    });

    expect(get).toHaveBeenCalledWith(
      '/hepsijet/delivery/available-dates',
      expect.objectContaining({ timeout: 60000 }),
    );
  });

  it('recreates a return as PTT with the extended upload timeout', async () => {
    await recreateReturnAsPttDto(7, {
      orderId: 1,
      cargoCompany: 'ptt',
      items: [],
    });

    expect(post).toHaveBeenCalledWith(
      '/return-requests/7/recreate-ptt',
      undefined,
      expect.objectContaining({ timeout: 300000 }),
    );
  });
});
