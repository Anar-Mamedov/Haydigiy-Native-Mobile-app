import { fireEvent, screen } from '@testing-library/react-native';
import { ReviewTabs } from './review-tabs';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReviewTab } from '@/types/review.types';

const TABS: ReviewTab[] = [
  { key: 'pending', label: 'Değerlendir' },
  { key: 'waiting', label: 'Onay Bekleyenler' },
  { key: 'approved', label: 'Onaylananlar' },
];

describe('ReviewTabs', () => {
  it('renders every tab label and marks the active tab as selected', () => {
    renderWithTamagui(<ReviewTabs activeKey="pending" onChange={jest.fn()} tabs={TABS} />);

    expect(screen.getByText('Değerlendir')).toBeTruthy();
    expect(screen.getByText('Onay Bekleyenler')).toBeTruthy();
    expect(screen.getByText('Onaylananlar')).toBeTruthy();
    expect(screen.getByLabelText('Değerlendir').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('calls onChange with the pressed tab key', () => {
    const onChange = jest.fn();
    renderWithTamagui(<ReviewTabs activeKey="pending" onChange={onChange} tabs={TABS} />);

    fireEvent.press(screen.getByLabelText('Onaylananlar'));
    expect(onChange).toHaveBeenCalledWith('approved');
  });

  it('keeps tab labels visible in dark theme', () => {
    renderWithTamagui(
      <ReviewTabs activeKey="approved" onChange={jest.fn()} tabs={TABS} />,
      'dark',
    );

    expect(screen.getByText('Değerlendir')).toBeTruthy();
    expect(screen.getByText('Onaylananlar')).toBeTruthy();
  });
});
