import { screen } from '@testing-library/react-native';
import { ProgressTrack } from '@/components/ui/progress-track';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ProgressTrack', () => {
  it('announces itself as a progress bar with its value', () => {
    renderWithTamagui(<ProgressTrack accessibilityLabel="Profil doluluk oranı" value={86} />);

    const track = screen.getByRole('progressbar');
    expect(track.props.accessibilityLabel).toBe('Profil doluluk oranı');
    expect(track.props.accessibilityValue).toEqual({ max: 100, min: 0, now: 86 });
  });

  it('fills the track to the given percent', () => {
    renderWithTamagui(<ProgressTrack accessibilityLabel="İlerleme" testID="track" value={71.4} />);

    expect(screen.getByTestId('track-fill')).toHaveStyle({ width: '71%' });
  });

  it('clamps values outside 0–100 and non-numbers', () => {
    const { rerender } = renderWithTamagui(<ProgressTrack accessibilityLabel="İlerleme" testID="track" value={140} />);
    expect(screen.getByTestId('track-fill')).toHaveStyle({ width: '100%' });

    rerender(<ProgressTrack accessibilityLabel="İlerleme" testID="track" value={-5} />);
    expect(screen.getByTestId('track-fill')).toHaveStyle({ width: '0%' });

    rerender(<ProgressTrack accessibilityLabel="İlerleme" testID="track" value={Number.NaN} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('renders in the dark theme too', () => {
    renderWithTamagui(<ProgressTrack accessibilityLabel="İlerleme" testID="track" value={50} />, 'dark');

    expect(screen.getByTestId('track-fill')).toHaveStyle({ width: '50%' });
  });
});
