import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MACRO_COLORS } from '@brotein/shared';
import type { MacroTotals } from '@brotein/shared';
import { colors } from '../theme';

interface MacroPieChartProps {
  totals: MacroTotals;
}

export default function MacroPieChart({ totals }: MacroPieChartProps) {
  const data = [
    {
      name: 'Protein',
      value: Number(totals.proteinG.toFixed(1)),
      color: MACRO_COLORS.protein,
      legendFontColor: colors.textMuted,
      legendFontSize: 13,
    },
    {
      name: 'Carbs',
      value: Number(totals.carbsG.toFixed(1)),
      color: MACRO_COLORS.carbs,
      legendFontColor: colors.textMuted,
      legendFontSize: 13,
    },
    {
      name: 'Fat',
      value: Number(totals.fatG.toFixed(1)),
      color: MACRO_COLORS.fat,
      legendFontColor: colors.textMuted,
      legendFontSize: 13,
    },
  ];

  const hasData = data.some((d) => d.value > 0);
  const screenWidth = Dimensions.get('window').width - 64;

  if (!hasData) {
    return (
      <View>
        <Text style={{ color: colors.textFaint }}>No macro data yet for this range.</Text>
      </View>
    );
  }

  return (
    <PieChart
      data={data}
      width={screenWidth}
      height={200}
      chartConfig={{
        color: () => colors.textMuted,
      }}
      accessor="value"
      backgroundColor="transparent"
      paddingLeft="8"
    />
  );
}
