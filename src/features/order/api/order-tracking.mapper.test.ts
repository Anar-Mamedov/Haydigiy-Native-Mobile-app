import { formatTrackingCode, mapOrderCargoTracking } from './order-tracking.mapper';

describe('mapOrderCargoTracking', () => {
  it('maps cargo movements into timeline progress and detail rows', () => {
    const tracking = mapOrderCargoTracking({
      order: {
        order_no: 'HG123',
        tracking_code: 'TRK12345678',
        status: { name: 'Kargoda' },
        cargo_company: 'Hepsijet',
      },
      cargo_movements: [
        {
          id: 2,
          movement_code: 'DELIVERING',
          movement_description: 'Dağıtıma çıktı',
          movement_location: 'İstanbul Transfer',
          movement_datetime: '2026-07-06T10:20:00.000Z',
        },
        {
          id: 1,
          movement_code: 'COLLECTED',
          movement_description: 'Gönderi alındı',
          movement_date: '2026-07-05',
        },
      ],
    });

    expect(tracking.trackingCode).toBe('TRK12345678');
    expect(tracking.cargoCompanyName).toBe('Hepsijet');
    expect(tracking.lastMovement?.location).toBe('İstanbul Transfer');
    expect(tracking.movements[0]?.description).toBe('Dağıtıma çıktı');
    expect(tracking.stages.map((stage) => [stage.key, stage.completed])).toEqual([
      ['handed', true],
      ['transfer', true],
      ['branch', true],
      ['courier', true],
      ['done', false],
    ]);
  });

  it('marks all stages complete when a delivered movement is present', () => {
    const tracking = mapOrderCargoTracking({
      cargo_movements: [
        {
          id: 3,
          movement_code: 'TESLIM',
          movement_description: 'Alıcıya teslim edildi',
        },
      ],
    });

    expect(tracking.delivered).toBe(true);
    expect(tracking.stages.every((stage) => stage.completed)).toBe(true);
    expect(tracking.movements[0]?.delivered).toBe(true);
  });

  it('normalizes Aras/panel responses and uses the Aras raw tracking number', () => {
    const tracking = mapOrderCargoTracking({
      order: {
        order_no: 'HG04',
        tracking_code: null,
        cargo_company: 'Aras Kargo',
      },
      cargo_status: 'Teslimat şubesinde',
      cargo_movements: [
        {
          id: 8,
          cargo_company_id: 8,
          movement_description: 'Varış şubesinde bekliyor',
          movement_location: 'NİĞDE',
          raw_response: {
            KARGO_TAKIP_NO: 'HG04 0726 9228 40',
          },
        },
      ],
    });

    expect(tracking.trackingCode).toBe('HG04 0726 9228 40');
    expect(tracking.cargoCompanyName).toBe('Aras Kargo');
    expect(tracking.lastMovement?.location).toBe('NİĞDE');
    expect(tracking.stages.map((stage) => [stage.key, stage.completed])).toEqual([
      ['handed', true],
      ['transfer', true],
      ['branch', true],
      ['courier', false],
      ['done', false],
    ]);
  });

  it('builds a usable timeline from cargo_status when movement rows are missing', () => {
    const tracking = mapOrderCargoTracking({
      cargo_status: 'Kurye dağıtımda',
      raw_response: { KARGO_TAKIP_NO: 'ARAS123' },
    });

    expect(tracking.trackingCode).toBe('ARAS123');
    expect(tracking.movements[0]?.description).toBe('Kurye dağıtımda');
    expect(tracking.stages.map((stage) => stage.completed)).toEqual([true, true, true, true, false]);
  });

  it('formats tracking codes in groups of four characters', () => {
    expect(formatTrackingCode('TRK12345678')).toBe('TRK1 2345 678');
  });
});
