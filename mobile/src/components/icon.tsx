import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type IconName = AndroidSymbol;

/** Material Symbols icon (https://fonts.google.com/icons). No SF Symbol is mapped: the app targets Android. */
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: ColorValue }) {
  const theme = useTheme();

  return <SymbolView name={{ android: name, web: name }} size={size} tintColor={color ?? theme.textSecondary} />;
}
