import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { insiderTracker } from '../services/insider-tracker';
import {
  cartItemToInsiderInput,
  productToInsiderInput,
} from '../utils/insider-product.mapper';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

/**
 * Insider page-view hooks. Screens stay declarative: they state *what* page
 * they are, and the firing rules (per-focus, per-data-arrival, dedupe) live
 * here so every screen behaves the same way.
 */

/** Fires `visitHomePage` every time the home screen gains focus. */
export function useTrackHomePageView(): void {
  useFocusEffect(
    useCallback(() => {
      insiderTracker.trackHomePageView();
    }, []),
  );
}

/**
 * Fires `visitListingPage` when the category taxonomy resolves. Pass `null`
 * while it is unknown (loading) or when the screen shows search results.
 */
export function useTrackListingPageView(taxonomy: string[] | null): void {
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!taxonomy || taxonomy.length === 0) return;
    const key = taxonomy.join('>');
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    insiderTracker.trackListingPageView(taxonomy);
  }, [taxonomy]);
}

/** Fires `visitProductDetailPage` once per product id when the full detail loads. */
export function useTrackProductDetailView(product: Product | null | undefined): void {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;
    if (lastIdRef.current === product.id) return;
    lastIdRef.current = product.id;
    insiderTracker.trackProductDetailView(productToInsiderInput(product));
  }, [product]);
}

/**
 * Fires a page view once per focus, as soon as the screen's data is ready.
 * Refocusing the screen counts as a new visit (mirrors the web page loads).
 */
function useTrackOncePerFocus(isReady: boolean, track: () => void): void {
  const isFocusedRef = useRef(false);
  const hasTrackedRef = useRef(false);
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;
  const trackRef = useRef(track);
  trackRef.current = track;

  const fireIfEligible = useCallback(() => {
    if (!isFocusedRef.current || !isReadyRef.current || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackRef.current();
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      hasTrackedRef.current = false;
      fireIfEligible();
      return () => {
        isFocusedRef.current = false;
      };
    }, [fireIfEligible]),
  );

  // Data may finish loading after focus; every commit re-checks eligibility and
  // the refs guarantee a single event per focus session.
  useEffect(() => {
    fireIfEligible();
  });
}

/** Fires `visitCartPage` with the loaded cart lines once per focus. */
export function useTrackCartPageView(items: CartLineItem[], isReady: boolean): void {
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useTrackOncePerFocus(isReady, () => {
    insiderTracker.trackCartView(itemsRef.current.map(cartItemToInsiderInput));
  });
}

/** Fires `visitWishlistPage` with the loaded favorites once per focus. */
export function useTrackWishlistPageView(products: Product[], isReady: boolean): void {
  const productsRef = useRef(products);
  productsRef.current = products;

  useTrackOncePerFocus(isReady, () => {
    insiderTracker.trackWishlistView(productsRef.current.map((product) => productToInsiderInput(product)));
  });
}
