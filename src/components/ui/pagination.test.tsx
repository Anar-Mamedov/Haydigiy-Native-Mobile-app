import { screen, fireEvent } from '@testing-library/react-native';
import { Pagination } from './pagination';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { toJSON } = renderWithTamagui(
      <Pagination currentPage={1} pageCount={1} onChange={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('changes page when a page number is pressed', () => {
    const onChange = jest.fn();
    renderWithTamagui(<Pagination currentPage={1} pageCount={3} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Sayfa 2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not call onChange for the previous control on the first page', () => {
    const onChange = jest.fn();
    renderWithTamagui(<Pagination currentPage={1} pageCount={3} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Önceki sayfa'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('advances with the next control', () => {
    const onChange = jest.fn();
    renderWithTamagui(<Pagination currentPage={1} pageCount={3} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Sonraki sayfa'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('windows many pages with the last page reachable', () => {
    const onChange = jest.fn();
    renderWithTamagui(<Pagination currentPage={1} pageCount={20} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Sayfa 20'));
    expect(onChange).toHaveBeenCalledWith(20);
  });
});
