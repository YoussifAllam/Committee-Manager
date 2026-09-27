import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing, type Tone } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Chip({ label, icon, tone = 'neutral' }: { label: string; icon: IconName; tone?: Tone }) {
  const theme = useTheme();
  const [color, backgroundColor] =
    tone === 'neutral' ? [theme.textSecondary, theme.surfaceMuted] : [theme[tone], theme[`${tone}Soft` as const]];

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Icon name={icon} size={14} color={color} />
      <ThemedText type="caption" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  label: {
    fontFamily: Fonts.semiBold,
  },
});
