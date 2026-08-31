import { useCallback, useState } from 'react';
import { calculateSize } from '@/services/product.service';

export type SizeCalculatorGender = 'child' | 'female' | 'male';

const HEIGHT_RANGE = { max: 250, min: 50 } as const;
const WEIGHT_RANGE = { max: 200, min: 10 } as const;

const INVALID_MEASUREMENTS_MESSAGE = 'Lütfen geçerli boy (50–250 cm) ve kilo (10–200 kg) girin.';
const EMPTY_RESULT_MESSAGE = 'Beden hesaplanamadı.';
const REQUEST_FAILED_MESSAGE = 'Beden hesaplanırken bir hata oluştu.';

/** Returns the measurement as a number, or `null` when it is missing/out of range. */
function parseMeasurement(value: string, range: { max: number; min: number }): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) return null;
  return parsed;
}

type UseSizeCalculatorOptions = {
  /** Called with the recommended size once the backend answers successfully. */
  onCalculated?: (recommendedSize: string) => void;
};

/**
 * Owns the beden-hesaplama form state, validation and request lifecycle so the
 * sheet stays a presentational component.
 */
export function useSizeCalculator({ onCalculated }: UseSizeCalculatorOptions = {}) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<SizeCalculatorGender>('female');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    const parsedHeight = parseMeasurement(height, HEIGHT_RANGE);
    const parsedWeight = parseMeasurement(weight, WEIGHT_RANGE);

    if (parsedHeight === null || parsedWeight === null) {
      setError(INVALID_MEASUREMENTS_MESSAGE);
      return;
    }

    setError(null);
    setResult(null);
    setIsCalculating(true);

    try {
      const response = await calculateSize(parsedHeight, parsedWeight, gender);
      const recommendedSize = response?.data?.recommended_size;

      if (response?.status === 'success' && recommendedSize) {
        setResult(recommendedSize);
        onCalculated?.(recommendedSize);
        return;
      }

      setError(EMPTY_RESULT_MESSAGE);
    } catch {
      setError(REQUEST_FAILED_MESSAGE);
    } finally {
      setIsCalculating(false);
    }
  }, [gender, height, onCalculated, weight]);

  return {
    calculate,
    error,
    gender,
    height,
    isCalculating,
    result,
    setGender,
    setHeight,
    setWeight,
    weight,
  };
}
