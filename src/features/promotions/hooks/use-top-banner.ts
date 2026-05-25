import { useEffect, useCallback, useState } from 'react';
import { usePathname } from 'expo-router';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { appStorage } from '@/lib/storage/mmkv';
import { TopBannerData, TimeLeft } from '../types/top-banner.types';

const DISMISS_PREFIX = 'hg_banner_dismissed_';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;
const ROTATION_INTERVAL_MS = 5000;

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function matchesPage(pages: string[] | null, pathname: string): boolean {
  if (!pages || pages.length === 0) return true;
  
  // Normalize pathname to match design pages configuration (like 'home')
  const normalizedPath =
    pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/'
      ? 'home'
      : pathname.replace(/^\//, '').split('/')[0];
      
  return pages.includes(normalizedPath) || pages.includes(pathname);
}

export function useTopBanner(banners: TopBannerData[]) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [expiredIds, setExpiredIds] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [progress, setProgress] = useState(0);

  // Authenticated state loading
  useEffect(() => {
    getAccessToken().then((token) => {
      setIsAuthenticated(!!token);
    });
  }, []);

  // Hydration + MMKV loading
  useEffect(() => {
    const checkDismissed = async () => {
      const dismissed = new Set<number>();
      for (const b of banners) {
        try {
          const dismissedValue = await appStorage.getItem(`${DISMISS_PREFIX}${b.id}`);
          if (dismissedValue) {
            const timePassed = Date.now() - parseInt(dismissedValue, 10);
            if (timePassed < DISMISS_TTL_MS) {
              dismissed.add(b.id);
            }
          }
        } catch {
          // Ignore storage read errors
        }
      }
      setDismissedIds(dismissed);
      setMounted(true);
    };

    checkDismissed();
  }, [banners]);

  // Filter banners: device, audience, page, dismissed, expired
  const visibleBanners = mounted
    ? banners.filter((b) => {
        if (dismissedIds.has(b.id)) return false;
        if (expiredIds.has(b.id)) return false;
        if (b.device !== 'all' && b.device !== 'mobile') return false;
        if (b.target_audience === 'guest' && isAuthenticated) return false;
        if (b.target_audience === 'logged_in' && !isAuthenticated) return false;
        if (!matchesPage(b.pages, pathname)) return false;
        return true;
      })
    : [];

  const currentBanner = visibleBanners[currentIndex % Math.max(visibleBanners.length, 1)] ?? null;

  // Banner rotation progress
  useEffect(() => {
    if (visibleBanners.length <= 1) {
      setProgress(0);
      return;
    }

    const tick = ROTATION_INTERVAL_MS / 100;
    let p = 0;

    const progressInterval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        p = 0;
        setCurrentIndex((i) => (i + 1) % visibleBanners.length);
      }
    }, tick);

    return () => {
      clearInterval(progressInterval);
      setProgress(0);
    };
  }, [visibleBanners.length]);

  // Index limits
  useEffect(() => {
    if (currentIndex >= visibleBanners.length && visibleBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [visibleBanners.length, currentIndex]);

  // Countdown timer
  useEffect(() => {
    if (!currentBanner?.countdown_enabled || !currentBanner.countdown_end_at) {
      setTimeLeft(null);
      return;
    }

    const update = () => {
      const tl = calcTimeLeft(currentBanner.countdown_end_at!);
      if (!tl) {
        setExpiredIds((prev) => {
          const next = new Set(prev);
          next.add(currentBanner.id);
          return next;
        });
        setTimeLeft(null);
      } else {
        setTimeLeft(tl);
      }
    };

    update();
    const countdownInterval = setInterval(update, 1000);
    return () => clearInterval(countdownInterval);
  }, [currentBanner?.id, currentBanner?.countdown_enabled, currentBanner?.countdown_end_at]);

  const handleDismiss = useCallback(async () => {
    if (!currentBanner) return;
    try {
      await appStorage.setItem(`${DISMISS_PREFIX}${currentBanner.id}`, String(Date.now()));
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(currentBanner.id);
        return next;
      });
    } catch (err) {
      console.warn('Failed to save dismissal:', err);
    }
  }, [currentBanner]);

  return {
    mounted,
    currentBanner,
    visibleBanners,
    timeLeft,
    progress,
    handleDismiss,
  };
}
