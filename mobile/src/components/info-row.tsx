import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Icon, small label and value; rows are stacked in a card and divided by hairlines. */
export function InfoRow({
  icon,
  label,
  value,
  valueColor,
  last,
}: {
  icon: IconName;
  label: string;
  value: string;
  valueColor?: ThemeColor;
  last?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} size={18} color={theme.primary} />
      </View>
      <View style={styles.text}>
        <ThemedText type="caption" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="label" themeColor={valueColor}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
