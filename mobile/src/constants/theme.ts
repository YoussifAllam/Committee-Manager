/**
 * Design tokens. The app is light-only: navy is the brand color, and semantic tones are reserved
 * for things that need attention.
 */

export const Colors = {
  text: '#141A2E',
  textSecondary: '#5A6479',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4F9',
  border: '#E3E8F0',
  primary: '#1E3A8A',
  primarySoft: '#E8EEFB',
  onPrimary: '#FFFFFF',
  headerGradient: ['#E2E9FB', '#F4F6FA'],
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
} as const;

export type ThemeColor = {
  [K in keyof typeof Colors]: (typeof Colors)[K] extends string ? K : never;
}[keyof typeof Colors];

export type Tone = 'neutral' | 'info' | 'violet' | 'success' | 'warning' | 'danger';

/**
 * Loaded in the root layout. Android picks a weight by font file, not `fontWeight`,
 * so every weight is its own family.
 */
export const Fonts = {
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
