import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { InfoPageLinkList } from './info-page-link-list';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const LINKS = [
  { slug: 'hakkimizda' as const, label: 'Hakkımızda' },
  { slug: 'subeden-al' as const, label: 'Mağazadan Al' },
];

describe('InfoPageLinkList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['light', 'dark'] as const)('renders the title and every link in the %s theme', (theme) => {
    renderWithTamagui(<InfoPageLinkList links={LINKS} title="Kurumsal" />, theme);

    expect(screen.getByText('Kurumsal')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Hakkımızda' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Mağazadan Al' })).toBeTruthy();
  });

  it('opens the info page route of the pressed link', () => {
    renderWithTamagui(<InfoPageLinkList links={LINKS} title="Kurumsal" />);

    fireEvent.press(screen.getByRole('link', { name: 'Mağazadan Al' }));

    expect(mockPush).toHaveBeenCalledWith('/bilgi/subeden-al');
  });

  it('renders nothing without links', () => {
    renderWithTamagui(<InfoPageLinkList links={[]} title="Kurumsal" />);

    expect(screen.queryByText('Kurumsal')).toBeNull();
  });
});
