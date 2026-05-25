export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title: string;
  url: string;
  icon?: string | null;
  order: number;
  target: string;
  status: number;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  children: MenuItem[];
  image?: string | null;
}

export interface MenuGroup {
  id: number;
  name: string;
  location: string;
  status: number;
}
