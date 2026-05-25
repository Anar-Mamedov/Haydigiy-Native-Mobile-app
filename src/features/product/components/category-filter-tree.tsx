import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Paragraph, XStack, YStack } from 'tamagui';
import { ChevronDown, ChevronRight } from '@tamagui/lucide-icons-2';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';
import { FilterCategory } from '@/types/product.types';

interface CategoryFilterTreeProps {
  activeIds: number[];
  categories: FilterCategory[];
  onToggle: (id: number) => void;
}

type CategoryNode = FilterCategory & {
  children: CategoryNode[];
};

function buildCategoryTree(categories: FilterCategory[]): CategoryNode[] {
  const nodeMap = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((category) => {
    nodeMap.set(category.id, { ...category, children: [] });
  });

  categories.forEach((category) => {
    const node = nodeMap.get(category.id);
    if (!node) return;

    const parentId = category.parentId;
    const parent = parentId ? nodeMap.get(parentId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function collectExpandableIds(nodes: CategoryNode[]): number[] {
  return nodes.flatMap((node) => [
    ...(node.children.length > 0 ? [node.id] : []),
    ...collectExpandableIds(node.children),
  ]);
}

export function CategoryFilterTree({ activeIds, categories, onToggle }: CategoryFilterTreeProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const expandableIds = useMemo(() => collectExpandableIds(tree), [tree]);
  const expandableKey = expandableIds.join(',');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set(expandableIds));

  // Re-expand only when the set of expandable categories actually changes by content,
  // not on every re-render (which would reset the user's expand/collapse state).
  useEffect(() => {
    setExpandedIds(new Set(expandableKey.length ? expandableKey.split(',').map(Number) : []));
  }, [expandableKey]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (node: CategoryNode, depth: number) => {
    const isExpanded = expandedIds.has(node.id);
    const isActive = activeIds.includes(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <YStack key={node.id}>
        <XStack alignItems="center" gap={6} minHeight={40} paddingLeft={depth * 18}>
          {hasChildren ? (
            <Pressable
              accessibilityLabel={`${node.name} alt kategorilerini ${isExpanded ? 'gizle' : 'göster'}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => toggleExpanded(node.id)}
            >
              {isExpanded ? <ChevronDown color="$color10" size={16} /> : <ChevronRight color="$color10" size={16} />}
            </Pressable>
          ) : (
            <YStack width={16} />
          )}
          <Pressable
            accessibilityLabel={`${node.name} kategori filtresi`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isActive }}
            onPress={() => onToggle(node.id)}
            style={{ flex: 1 }}
          >
            <XStack alignItems="center" gap={10}>
              <FilterCheckbox checked={isActive} size={22} />
              <Paragraph
                color={isActive ? '$brand' : '$color10'}
                flex={1}
                fontSize={14}
                fontWeight={hasChildren || depth === 0 ? '700' : '500'}
                numberOfLines={1}
              >
                {node.name}
                {node.productCount !== undefined ? (
                  <Paragraph color="$color9" fontSize={13}>
                    {' '}
                    ({node.productCount})
                  </Paragraph>
                ) : null}
              </Paragraph>
            </XStack>
          </Pressable>
        </XStack>
        {hasChildren && isExpanded ? node.children.map((child) => renderNode(child, depth + 1)) : null}
      </YStack>
    );
  };

  return <YStack>{tree.map((node) => renderNode(node, 0))}</YStack>;
}
