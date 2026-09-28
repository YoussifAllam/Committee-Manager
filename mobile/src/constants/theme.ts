/**
 * Design tokens. The app is light-only: teal (the app icon's green) is the brand color, and semantic tones are reserved
 * for things that need attention.
 */

export const Colors = {
  text: '#11201D',
  textSecondary: '#55645F',
  background: '#F3F7F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF4F2',
  border: '#DDE8E4',
  primary: '#0E7C73',
  primarySoft: '#E8F5F2',
  onPrimary: '#FFFFFF',
  headerGradient: ['#D6EEE8', '#F3F7F6'],
  brandGradient: ['#128A80', '#0B4F4A'],
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
