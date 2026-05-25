export const categoryKeys = {
  all: ['categories'] as const,
  groups: () => [...categoryKeys.all, 'groups'] as const,
  items: (groupId: number) => [...categoryKeys.all, 'items', groupId] as const,
  firstProductImage: (categoryId: number) => [...categoryKeys.all, 'productImage', categoryId] as const,
};
