import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'tonal';
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, icon, variant = 'primary', compact, onPress, style }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const color = isPrimary ? theme.onPrimary : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: isPrimary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(27, 43, 107, 0.12)' }}
      style={[
        styles.button,
        compact && styles.compact,
        { backgroundColor: isPrimary ? theme.primary : theme.primarySoft },
        style,
      ]}>
      {icon && <Icon name={icon} size={compact ? 18 : 20} color={color} />}
      <ThemedText type="label" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: Spacing.three - Spacing.one,
    alignSelf: 'flex-start',
  },
});
