import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: keyof typeof styles;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

// Arabic script needs roughly 1.6× line height so marks above and below letters aren't clipped.
// Scale: page titles 24, section titles 18, card titles 16, body 15, details 13.
const styles = StyleSheet.create({
  page: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 38,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 28,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    lineHeight: 26,
  },
  default: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 22,
  },
  small: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 21,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 21,
  },
});
