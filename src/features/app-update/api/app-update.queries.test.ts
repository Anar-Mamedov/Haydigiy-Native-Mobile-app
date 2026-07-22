import { useQuery } from '@tanstack/react-query';
import { useLatestAppVersionQuery } from './app-update.queries';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

const useQueryMock = useQuery as jest.Mock;

describe('useLatestAppVersionQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQueryMock.mockReturnValue({});
  });

  it('always treats the version as stale and immediately discards inactive data', () => {
    useLatestAppVersionQuery();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnReconnect: 'always',
        staleTime: 0,
      }),
    );
  });
});
