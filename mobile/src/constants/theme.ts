/**
 * Design tokens. The app is light-only: sky blue (the app icon's color) is the brand color, and semantic tones are reserved
 * for things that need attention.
 */

export const Colors = {
  text: '#0F1B2A',
  textSecondary: '#546474',
  background: '#F3F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4F8',
  border: '#DEE7EE',
  primary: '#0272AF',
  primarySoft: '#E6F4FC',
  onPrimary: '#FFFFFF',
  headerGradient: ['#D6EEFB', '#F3F7FA'],
  brandGradient: ['#0EA5E9', '#0369A1'],
  info: '#2A5BD7',
  infoSoft: '#E8EFFD',
  violet: '#6D3FC0',
  violetSoft: '#F0EAFB',
  success: '#347A27',
  successSoft: '#E8F4E2',
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
 * so every weight is its own family. Tajawal has no 600, so buttons and headings share 700.
 */
export const Fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  semiBold: 'Tajawal_700Bold',
  bold: 'Tajawal_700Bold',
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
