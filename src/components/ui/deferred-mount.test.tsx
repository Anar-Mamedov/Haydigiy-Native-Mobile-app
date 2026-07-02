import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DeferredMount } from './deferred-mount';

describe('DeferredMount', () => {
  it('renders the placeholder first, then the children after interactions settle', async () => {
    render(
      <DeferredMount placeholder={<Text>bekliyor</Text>}>
        <Text>içerik</Text>
      </DeferredMount>,
    );

    expect(screen.queryByText('içerik')).toBeNull();
    expect(screen.getByText('bekliyor')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('içerik')).toBeTruthy());
    expect(screen.queryByText('bekliyor')).toBeNull();
  });

  it('renders nothing before mount when no placeholder is given', async () => {
    render(
      <DeferredMount>
        <Text>içerik</Text>
      </DeferredMount>,
    );

    expect(screen.queryByText('içerik')).toBeNull();

    await waitFor(() => expect(screen.getByText('içerik')).toBeTruthy());
  });
});
