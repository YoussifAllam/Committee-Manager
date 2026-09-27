/**
 * Design tokens. "Ink" navy is the brand; semantic tones are reserved for things that need attention.
 * Learn more about light and dark modes: https://docs.expo.dev/guides/color-schemes/
 */

export const Colors = {
  light: {
    text: '#141A2E',
    textSecondary: '#5A6479',
    background: '#F3F5FA',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F3F9',
    border: '#E2E7F0',
    primary: '#1B2B6B',
    primarySoft: '#E7ECFA',
    onPrimary: '#FFFFFF',
    headerGradient: ['#22357F', '#0F1A47'],
    info: '#2A5BD7',
    infoSoft: '#E8EFFD',
    violet: '#6D3FC0',
    violetSoft: '#F0EAFB',
    success: '#1E7F4F',
    successSoft: '#E4F4EA',
    warning: '#A15C0B',
    warningSoft: '#FDF1DE',
    danger: '#C8312B',
    dangerSoft: '#FCEBEA',
  },
  dark: {
    text: '#E9EDF7',
    textSecondary: '#A7B0C5',
    background: '#0B1020',
    surface: '#141B30',
    surfaceMuted: '#1B2440',
    border: '#26304D',
    primary: '#8EA6FF',
    primarySoft: '#1E2A52',
    onPrimary: '#0B1020',
    headerGradient: ['#1C2A62', '#0E1533'],
    info: '#7FA6FF',
    infoSoft: 'rgba(127, 166, 255, 0.14)',
    violet: '#B79BFF',
    violetSoft: 'rgba(183, 155, 255, 0.14)',
    success: '#4CC98A',
    successSoft: 'rgba(76, 201, 138, 0.14)',
    warning: '#F5B544',
    warningSoft: 'rgba(245, 181, 68, 0.14)',
    danger: '#FF7A70',
    dangerSoft: 'rgba(255, 122, 112, 0.14)',
  },
} as const;

export type ThemeColor = {
  [K in keyof typeof Colors.light]: (typeof Colors.light)[K] extends string ? K : never;
}[keyof typeof Colors.light];

export type Tone = 'neutral' | 'info' | 'violet' | 'success' | 'warning' | 'danger';

/**
 * Loaded in the root layout. Android picks a weight by font file, not `fontWeight`,
 * so every weight is its own family.
 */
export const Fonts = {
  display: 'ReemKufi_700Bold',
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semiBold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
