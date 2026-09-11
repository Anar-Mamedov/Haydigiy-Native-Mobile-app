import { useEffect, useReducer } from 'react';

export type CampaignTimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Süre dolduğunda ya da gösterilebilir bir bitiş tarihi olmadığında `true`. */
  expired: boolean;
};

const EXPIRED: CampaignTimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: true,
};

/**
 * Kampanya bitişine kalan süre. Tarih yoksa ya da çözümlenemiyorsa süre dolmuş
 * sayılır; böylece sayaç bileşenleri eksik veride "NaN" göstermek yerine hiç
 * render edilmez.
 */
export function getCampaignTimeLeft(
  endDate: string | null | undefined,
  now: number = Date.now(),
): CampaignTimeLeft {
  if (!endDate) return EXPIRED;

  const endTime = new Date(endDate).getTime();
  if (!Number.isFinite(endTime)) return EXPIRED;

  const diff = Math.max(0, endTime - now);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: diff === 0,
  };
}

/**
 * Saniyede bir azalan kalan süre. Süre dolduğunda ya da bitiş tarihi hiç
 * gelmediğinde aralık kurulmaz/temizlenir; kapanmış bir kampanya için timer
 * çalışmaya devam etmez.
 *
 * Kalan süre state'te tutulmaz, her render'da tarihten yeniden hesaplanır:
 * `endDate` değiştiğinde senkronlayacak bir efekt gerekmez ve sayaç ile prop
 * hiçbir anda birbirinden ayrı düşmez. Efekt yalnızca saniyelik yeniden
 * render'ı tetikler.
 */
export function useCampaignTimeLeft(endDate: string | null | undefined): CampaignTimeLeft {
  const [, tick] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    if (getCampaignTimeLeft(endDate).expired) return;

    const interval = setInterval(() => {
      tick();
      if (getCampaignTimeLeft(endDate).expired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return getCampaignTimeLeft(endDate);
}
