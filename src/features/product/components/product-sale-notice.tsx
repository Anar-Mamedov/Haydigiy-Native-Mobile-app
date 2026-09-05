import { Paragraph } from '@/components/ui/app-paragraph';

/** Shared sale-closure message for the product's size selectors. */
export function ProductSaleNotice({ isApprovedForSale }: { isApprovedForSale: boolean }) {
  if (isApprovedForSale) return null;

  return (
    <Paragraph accessibilityRole="alert" color="$red11" fontSize="$3" fontWeight="500">
      Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.
    </Paragraph>
  );
}
