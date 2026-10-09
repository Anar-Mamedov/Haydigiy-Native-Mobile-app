import { getFitSheetMaxHeight } from './use-fit-sheet-max-height';

describe('getFitSheetMaxHeight', () => {
  it('keeps the sheet below the status bar on notched iPhones', () => {
    // iPhone 15 Pro: 852 pt window, 59 pt top inset.
    const maxHeight = getFitSheetMaxHeight(852, 59);

    expect(maxHeight).toBeLessThanOrEqual(852 - 59);
    expect(maxHeight).toBe(781);
  });

  it('caps the sheet at 92% of the window when the top inset is small', () => {
    expect(getFitSheetMaxHeight(667, 20)).toBe(Math.round(667 * 0.92));
  });
});
