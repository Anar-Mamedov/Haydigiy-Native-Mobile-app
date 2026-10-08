import {
  BirthDateLimit,
  clampBirthDateParts,
  combineBirthDate,
  getDayOptions,
  getMaxBirthDate,
  getMonthOptions,
  getYearOptions,
  splitBirthDate,
} from './birth-date';

// 8 Ekim 2026'da 16 yaşını dolduran en geç doğum günü: 8 Ekim 2010.
const TODAY = new Date(2026, 9, 8);
const LIMIT: BirthDateLimit = { day: 8, month: 10, year: 2010 };

describe('splitBirthDate', () => {
  it('splits a YYYY-MM-DD string into parts', () => {
    expect(splitBirthDate('1990-05-08')).toEqual({ day: '08', month: '05', year: '1990' });
  });

  it('returns empty parts for null or malformed input', () => {
    expect(splitBirthDate(null)).toEqual({ day: '', month: '', year: '' });
    expect(splitBirthDate('1990')).toEqual({ day: '', month: '', year: '' });
  });
});

describe('combineBirthDate', () => {
  it('combines and zero-pads parts into YYYY-MM-DD', () => {
    expect(combineBirthDate({ day: '8', month: '5', year: '1990' })).toBe('1990-05-08');
  });

  it('returns null when any part is missing', () => {
    expect(combineBirthDate({ day: '8', month: '', year: '1990' })).toBeNull();
    expect(combineBirthDate({ day: '', month: '', year: '' })).toBeNull();
  });
});

describe('getMaxBirthDate', () => {
  it('returns the latest birth date that is 16 years old today (web getMaxBirthday)', () => {
    expect(getMaxBirthDate(undefined, TODAY)).toEqual(LIMIT);
  });

  it('honours a custom minimum age', () => {
    expect(getMaxBirthDate(18, TODAY)).toEqual({ day: 8, month: 10, year: 2008 });
  });

  it('rolls 29 February over like the web Date math', () => {
    // 2010 artık yıl değil; 29 Şubat 1 Mart'a kayar.
    expect(getMaxBirthDate(18, new Date(2028, 1, 29))).toEqual({ day: 1, month: 3, year: 2010 });
  });
});

describe('getYearOptions', () => {
  // Regresyon: eskiden en yeni yıl "bu yıl − 8" idi.
  it('caps the newest year at the 16-year limit and lists 92 years', () => {
    const options = getYearOptions(LIMIT);

    expect(options[0]).toEqual({ label: '2010', value: '2010' });
    expect(options).toHaveLength(92);
    expect(options.at(-1)?.value).toBe('1919');
  });

  it('uses today by default', () => {
    const expectedMaxYear = String(getMaxBirthDate().year);
    expect(getYearOptions()[0].value).toBe(expectedMaxYear);
  });

  it('keeps a year saved under the old 8-year rule at the top of the list', () => {
    const options = getYearOptions(LIMIT, 92, '2015');

    expect(options[0]).toEqual({ label: '2015', value: '2015' });
    expect(options[1]).toEqual({ label: '2010', value: '2010' });
  });

  it('does not duplicate a kept year that is already in range', () => {
    expect(getYearOptions(LIMIT, 92, '1990')).toEqual(getYearOptions(LIMIT));
  });
});

describe('getMonthOptions', () => {
  it('offers all twelve months for older years or no year', () => {
    expect(getMonthOptions({ year: '2009' }, LIMIT)).toHaveLength(12);
    expect(getMonthOptions({ year: '' }, LIMIT)).toHaveLength(12);
  });

  it('hides months after the limit month in the limit year', () => {
    const options = getMonthOptions({ year: '2010' }, LIMIT);

    expect(options).toHaveLength(10);
    expect(options.at(-1)).toEqual({ label: 'Ekim', value: '10' });
  });
});

describe('getDayOptions', () => {
  it('offers 31 days unless the limit year and month are both picked', () => {
    expect(getDayOptions({ month: '10', year: '2009' }, LIMIT)).toHaveLength(31);
    expect(getDayOptions({ month: '09', year: '2010' }, LIMIT)).toHaveLength(31);
    expect(getDayOptions(undefined, LIMIT)).toHaveLength(31);
  });

  it('hides days after the limit day in the limit month', () => {
    const options = getDayOptions({ month: '10', year: '2010' }, LIMIT);

    expect(options).toHaveLength(8);
    expect(options.at(-1)).toEqual({ label: '8', value: '08' });
  });
});

describe('clampBirthDateParts', () => {
  it('clears a month that is no longer offered after picking the limit year', () => {
    expect(clampBirthDateParts({ day: '20', month: '11', year: '2010' }, LIMIT)).toEqual({
      day: '20',
      month: '',
      year: '2010',
    });
  });

  it('clears a day that is no longer offered in the limit month', () => {
    expect(clampBirthDateParts({ day: '09', month: '10', year: '2010' }, LIMIT)).toEqual({
      day: '',
      month: '10',
      year: '2010',
    });
  });

  it('keeps valid and older dates untouched', () => {
    const limitDay = { day: '08', month: '10', year: '2010' };
    const older = { day: '31', month: '12', year: '2009' };

    expect(clampBirthDateParts(limitDay, LIMIT)).toEqual(limitDay);
    expect(clampBirthDateParts(older, LIMIT)).toEqual(older);
  });
});
