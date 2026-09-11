import { getCampaignTimeLeft } from './use-campaign-time-left';

const NOW = new Date('2026-06-17T00:00:00Z').getTime();

describe('getCampaignTimeLeft', () => {
  it('breaks the remaining milliseconds into days, hours, minutes and seconds', () => {
    const endDate = new Date(NOW + (26 * 3600 + 5 * 60 + 9) * 1000).toISOString();
    expect(getCampaignTimeLeft(endDate, NOW)).toEqual({
      days: 1,
      hours: 2,
      minutes: 5,
      seconds: 9,
      expired: false,
    });
  });

  it('reports an expired campaign once the end date has passed', () => {
    expect(getCampaignTimeLeft('2026-01-01T00:00:00Z', NOW).expired).toBe(true);
  });

  // Sayaç anahtarı açık olan kampanyada bitiş tarihi hiç gelmeyebiliyor; o
  // durumda sayaç "NaN" yazmak yerine hiç görünmemeli.
  it('reports expired for a missing or unparseable end date', () => {
    expect(getCampaignTimeLeft(null, NOW).expired).toBe(true);
    expect(getCampaignTimeLeft(undefined, NOW).expired).toBe(true);
    expect(getCampaignTimeLeft('', NOW).expired).toBe(true);
    expect(getCampaignTimeLeft('bir tarih değil', NOW).expired).toBe(true);
  });
});
