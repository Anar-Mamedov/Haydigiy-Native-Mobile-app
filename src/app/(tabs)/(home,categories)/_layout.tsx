import { TabStackLayout } from '@/components/navigation/tab-stack-layout';

export const unstable_settings = {
  home: {
    anchor: 'index',
  },
  categories: {
    anchor: 'categories',
  },
};

export default function HomeCategoriesStackLayout() {
  return <TabStackLayout />;
}
