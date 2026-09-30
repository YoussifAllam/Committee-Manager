import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  label: string;
  icon?: IconName;
  /** primary: the screen's main action; tonal: secondary; plain: low-emphasis; danger: destructive. */
  variant?: 'primary' | 'tonal' | 'plain' | 'danger';
  compact?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  icon,
  variant = 'primary',
  compact,
  disabled,
  accessibilityLabel,
  onPress,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const [backgroundColor, color] = {
    primary: [theme.primary, theme.onPrimary],
    tonal: [theme.primarySoft, theme.primary],
    plain: ['transparent', theme.textSecondary],
    danger: [theme.dangerSoft, theme.danger],
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      // Compact buttons are drawn 36 high; the slop keeps the touch area at 44.
      hitSlop={compact ? { top: Spacing.one, bottom: Spacing.one } : undefined}
      onPress={onPress}
      android_ripple={{ color: variant === 'primary' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(2, 114, 175, 0.12)' }}
      style={[styles.button, compact && styles.compact, { backgroundColor }, disabled && styles.disabled, style]}>
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
  disabled: {
    opacity: 0.5,
  },
});
