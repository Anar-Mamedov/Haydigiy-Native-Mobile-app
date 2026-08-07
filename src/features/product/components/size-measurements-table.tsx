import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { buildSizeMeasurementTable } from '../utils/size-measurement-table';
import { SizeMeasurement } from '@/types/product.types';

type SizeMeasurementsTableProps = {
  measurements?: SizeMeasurement[] | null;
};

const SIZE_COLUMN_WIDTH = 92;
const VALUE_COLUMN_WIDTH = 132;

/**
 * Beden ölçüleri tablosu (`size_measurements`). Satırlar bedenler, kolonlar ölçü
 * adlarıdır. Kolonlar sığmadığında tablo yatay kaydırılır; veri yoksa hiçbir şey
 * render edilmez. Renkler token üzerinden geldiği için açık/koyu temada okunur.
 */
export function SizeMeasurementsTable({ measurements }: SizeMeasurementsTableProps) {
  const table = buildSizeMeasurementTable(measurements);
  if (!table) return null;

  return (
    <YStack
      borderTopColor="$borderColor"
      borderTopWidth={1}
      gap="$3"
      paddingTop="$4"
      testID="size-measurements-table"
    >
      <Paragraph color="$color" fontSize={15} fontWeight="700">
        Beden Ölçüleri
      </Paragraph>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YStack borderColor="$borderColor" borderRadius={8} borderWidth={1} overflow="hidden">
          <XStack backgroundColor="$color3">
            <Paragraph
              color="$color10"
              fontSize={12}
              fontWeight="700"
              paddingHorizontal="$3"
              paddingVertical="$2.5"
              width={SIZE_COLUMN_WIDTH}
            >
              Beden
            </Paragraph>
            {table.columns.map((column) => (
              <Paragraph
                color="$color10"
                fontSize={12}
                fontWeight="700"
                key={column.key}
                paddingHorizontal="$3"
                paddingVertical="$2.5"
                width={VALUE_COLUMN_WIDTH}
              >
                {column.label}
              </Paragraph>
            ))}
          </XStack>

          {table.rows.map((row, rowIndex) => (
            <XStack
              borderTopColor="$borderColor"
              borderTopWidth={1}
              key={`${row.sizeName}-${rowIndex}`}
            >
              <Paragraph
                color="$color"
                fontSize={12}
                fontWeight="700"
                paddingHorizontal="$3"
                paddingVertical="$2.5"
                width={SIZE_COLUMN_WIDTH}
              >
                {row.sizeName}
              </Paragraph>
              {row.values.map((value, valueIndex) => (
                <Paragraph
                  color="$color"
                  fontSize={12}
                  key={table.columns[valueIndex]?.key ?? valueIndex}
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                  width={VALUE_COLUMN_WIDTH}
                >
                  {value}
                </Paragraph>
              ))}
            </XStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
