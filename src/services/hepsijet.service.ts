import { apiClient } from '@/lib/axios';
import { uuidv4 } from '@/utils/uuid';
import { ResolvedAddress } from '@/types/order.types';

// Hepsijet scheduled return (home pickup) service.
// available-dates: returns the bookable days for an address (city/town) and range.
// send: creates a scheduled pickup. cancel: cancels a previously created pickup.

export type HepsijetDay = {
  date: string;
  returnedLimit: number;
  tmhReturnedCapacity: number;
};

type HepsijetXDock = { xDockName?: string; days?: HepsijetDay[] };
type HepsijetTown = { townName?: string; xDock?: HepsijetXDock[] };
type HepsijetCity = { cityName?: string; towns?: HepsijetTown[] };

type AvailableDatesResponse = {
  success?: boolean;
  data?: { status?: string; data?: HepsijetCity[] };
};

export type AvailableDatesParams = {
  startDate: string;
  endDate: string;
  city: string;
  town: string;
};

// returnedLimit is the remaining capacity, tmhReturnedCapacity the used capacity;
// a day is bookable while there is remaining capacity (limit > used).
const isDayAvailable = (day: HepsijetDay): boolean => {
  const limit = Number(day?.returnedLimit ?? 0);
  const used = Number(day?.tmhReturnedCapacity ?? 0);
  return Number.isFinite(limit) && Number.isFinite(used) && limit > used;
};

export const getHepsijetAvailableDates = async (
  params: AvailableDatesParams,
): Promise<string[]> => {
  const res = await apiClient.get<AvailableDatesResponse>('/hepsijet/delivery/available-dates', {
    params,
  });

  const cities = res?.data?.data?.data;
  if (!Array.isArray(cities)) return [];

  const dates = new Set<string>();
  cities.forEach((city) => {
    (city?.towns || []).forEach((town) => {
      (town?.xDock || []).forEach((xDock) => {
        (xDock?.days || []).forEach((day) => {
          if (day?.date && isDayAvailable(day)) dates.add(day.date);
        });
      });
    });
  });

  return Array.from(dates).sort();
};

export type HepsijetReceiver = {
  firstName: string;
  lastName: string;
  phone1: string;
};

export type BuildSendPayloadArgs = {
  deliveryDate: string;
  customerOrderNo: string;
  sender: Pick<ResolvedAddress, 'city' | 'town' | 'district' | 'addressLine1'>;
  receiver: HepsijetReceiver;
};

export const getHepsijetReturnDeliveryNo = (customerOrderNo: string): string => {
  const normalizedOrderNo = customerOrderNo.trim();
  return normalizedOrderNo.endsWith('-R') ? normalizedOrderNo : `${normalizedOrderNo}-R`;
};

// HAYDİGİY warehouse and other constants are sent verbatim, matching the sample request.
const HAYDIGIY_RECIPIENT_ADDRESS = {
  companyAddressId: 'hayd-haydigiy-168',
  country: { name: 'Türkiye' },
  city: { name: 'Niğde' },
  town: { name: 'Merkez' },
  district: { name: 'Kale' },
  addressLine1: 'KALE MAH EMİN ERİŞİRGİL BLV C BLOK NO 16/127 MERKEZ NİĞDE',
};

export const buildHepsijetSendPayload = ({
  deliveryDate,
  customerOrderNo,
  sender,
  receiver,
}: BuildSendPayloadArgs) => {
  const returnDeliveryNo = getHepsijetReturnDeliveryNo(customerOrderNo);

  return {
    company: { name: 'HAYDİGİY', abbreviationCode: 'HAYDİGİY' },
    delivery: {
      deliveryDateOriginal: deliveryDate,
      customerDeliveryNo: returnDeliveryNo,
      customerOrderId: customerOrderNo,
      totalParcels: '1',
      desi: '4',
      deliverySlotOriginal: '0',
      deliveryType: 'RETURNED',
      product: { productCode: 'HX_STD' },
      senderAddress: {
        // Hepsijet ignores the body address if it sees a known companyAddressId,
        // so every send must carry a unique id.
        companyAddressId: uuidv4(),
        country: { name: 'Türkiye' },
        city: { name: sender.city },
        town: { name: sender.town },
        district: { name: sender.district },
        addressLine1: sender.addressLine1,
      },
      receiver: {
        // Must be unique per send.
        companyCustomerId: uuidv4(),
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        phone1: receiver.phone1,
        phone2: '',
        email: '',
      },
      recipientAddress: HAYDIGIY_RECIPIENT_ADDRESS,
      recipientPerson: 'Alparslan',
      recipientPersonPhone1: '05555555555',
    },
    currentXDock: { abbreviationCode: 'HAYDİGİYMERKEZ' },
  };
};

export type HepsijetSendPayload = ReturnType<typeof buildHepsijetSendPayload>;

export const sendHepsijetDelivery = async (payload: HepsijetSendPayload) => {
  const res = await apiClient.post('/hepsijet/delivery/send', payload);
  return res.data;
};

export type CancelHepsijetDeliveryResponse = {
  success?: boolean;
  message?: string;
  data?: { status?: string; message?: string };
};

/** Cancels a scheduled return (home pickup) delivery. */
export const cancelHepsijetDelivery = async (
  deliveryNo: string,
): Promise<CancelHepsijetDeliveryResponse> => {
  const res = await apiClient.delete<CancelHepsijetDeliveryResponse>(
    `/hepsijet/delivery/${encodeURIComponent(deliveryNo)}`,
  );
  return res.data;
};
