import { renderHook } from '@testing-library/react-native';
import { useSizeShortcutFilter } from './use-size-shortcut-filter';

describe('useSizeShortcutFilter', () => {
  it('marks only the size that matches the applied variants', () => {
    const { result } = renderHook(() => useSizeShortcutFilter(266, '274,232,30', jest.fn()));

    expect(result.current.items.filter((item) => item.isActive).map((item) => item.label)).toEqual(['M']);
  });

  it('reports the next variants when a size is pressed', () => {
    const onChangeVariants = jest.fn();
    const { result } = renderHook(() => useSizeShortcutFilter(266, '274,232,30', onChangeVariants));
    const [small, medium] = result.current.items;

    result.current.toggle(small);
    expect(onChangeVariants).toHaveBeenLastCalledWith('256,234,31');

    result.current.toggle(medium);
    expect(onChangeVariants).toHaveBeenLastCalledWith(undefined);
  });

  it('has no shortcuts for a category without a size definition', () => {
    const { result } = renderHook(() => useSizeShortcutFilter(208, undefined, jest.fn()));

    expect(result.current.items).toEqual([]);
  });
});
