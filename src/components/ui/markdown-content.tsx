import * as React from 'react';
import { Image } from 'expo-image';
import { type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import Markdown, {
  type ASTNode,
  type MarkdownStyles,
  type RenderRules,
} from 'react-native-markdown-renderer';
import { YStack, useTheme } from 'tamagui';

type MarkdownContentProps = Readonly<{
  children: string;
  testID?: string;
}>;

const MARKDOWN_IMAGE_HANDLERS: string[] = [
  'https://',
  'http://',
  'data:image/png;base64',
  'data:image/jpeg;base64',
  'data:image/gif;base64',
];

const MARKDOWN_IMAGE_STYLE: ImageStyle = {
  borderRadius: 8,
  height: 220,
  marginBottom: 12,
  width: '100%',
};

function isAllowedMarkdownImageSource(src: unknown): src is string {
  return typeof src === 'string' && MARKDOWN_IMAGE_HANDLERS.some((handler) => src.startsWith(handler));
}

function renderMarkdownImage(node: ASTNode) {
  const src = node.attributes.src;

  if (!isAllowedMarkdownImageSource(src)) {
    return null;
  }

  return (
    <Image
      accessibilityLabel={node.attributes.alt || undefined}
      accessibilityRole="image"
      contentFit="cover"
      key={node.key}
      source={{ uri: src }}
      style={MARKDOWN_IMAGE_STYLE}
    />
  );
}

export function MarkdownContent({ children, testID }: MarkdownContentProps) {
  const theme = useTheme();
  const bodyColor = theme.color11.val;
  const headingColor = theme.color.val;
  const brandColor = theme.brand?.val ?? headingColor;
  const borderColor = theme.borderColor.val;
  const mutedBackground = theme.color3.val;
  const tableHeaderBackground = theme.color2.val;

  const rules = React.useMemo<RenderRules>(
    () => ({
      image: renderMarkdownImage,
    }),
    []
  );

  const styles = React.useMemo<Partial<MarkdownStyles>>(
    () => ({
      blockquote: {
        borderLeftColor: borderColor,
        borderLeftWidth: 3,
        marginBottom: 12,
        paddingHorizontal: 12,
      } satisfies ViewStyle,
      codeBlock: {
        backgroundColor: mutedBackground,
        borderRadius: 8,
        color: bodyColor,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 12,
        padding: 12,
      } satisfies TextStyle,
      codeInline: {
        backgroundColor: mutedBackground,
        borderRadius: 6,
        color: headingColor,
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 2,
      } satisfies TextStyle,
      heading: {
        color: headingColor,
        fontWeight: '700',
      } satisfies TextStyle,
      heading1: {
        fontSize: 17,
        lineHeight: 23,
      } satisfies TextStyle,
      heading1Container: {
        borderBottomWidth: 0,
        marginBottom: 6,
        marginTop: 0,
        paddingBottom: 0,
      } satisfies ViewStyle,
      heading2: {
        fontSize: 15,
        lineHeight: 21,
      } satisfies TextStyle,
      heading2Container: {
        borderBottomWidth: 0,
        marginBottom: 6,
        marginTop: 0,
        paddingBottom: 0,
      } satisfies ViewStyle,
      heading3: {
        fontSize: 14,
        lineHeight: 20,
      } satisfies TextStyle,
      headingContainer: {
        flexDirection: 'row',
        marginBottom: 6,
        marginTop: 0,
      } satisfies ViewStyle,
      hr: {
        backgroundColor: borderColor,
        height: 1,
        marginBottom: 14,
        marginTop: 2,
      } satisfies ViewStyle,
      image: MARKDOWN_IMAGE_STYLE,
      link: {
        color: brandColor,
        fontWeight: '700',
      } satisfies TextStyle,
      list: {
        marginBottom: 12,
      } satisfies ViewStyle,
      listOrderedItemIcon: {
        color: bodyColor,
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 0,
        marginRight: 8,
      } satisfies TextStyle,
      listOrderedItemText: {
        color: bodyColor,
        fontSize: 12,
        lineHeight: 18,
      } satisfies TextStyle,
      listUnorderedItemIcon: {
        color: bodyColor,
        fontSize: 16,
        lineHeight: 18,
        marginLeft: 2,
        marginRight: 8,
      } satisfies TextStyle,
      listUnorderedItemText: {
        color: bodyColor,
        fontSize: 12,
        lineHeight: 18,
      } satisfies TextStyle,
      paragraph: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        marginTop: 0,
      } satisfies ViewStyle,
      strong: {
        color: headingColor,
        fontWeight: '700',
      } satisfies TextStyle,
      table: {
        borderColor,
        borderWidth: 1,
        marginBottom: 12,
      } satisfies ViewStyle,
      tableHeader: {
        backgroundColor: tableHeaderBackground,
      } satisfies ViewStyle,
      tableHeaderCell: {
        borderColor,
        color: headingColor,
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 6,
      } satisfies TextStyle,
      tableRow: {
        borderColor,
      } satisfies ViewStyle,
      tableRowCell: {
        borderColor,
        color: bodyColor,
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 6,
      } satisfies TextStyle,
      text: {
        color: bodyColor,
        fontSize: 12,
        lineHeight: 18,
      } satisfies TextStyle,
    }),
    [bodyColor, borderColor, brandColor, headingColor, mutedBackground, tableHeaderBackground]
  );

  return (
    <YStack testID={testID}>
      <Markdown
        allowedImageHandlers={MARKDOWN_IMAGE_HANDLERS}
        defaultImageHandler={null}
        rules={rules}
        style={styles}
      >
        {children}
      </Markdown>
    </YStack>
  );
}
