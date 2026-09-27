import { Colors } from '@/constants/theme';

/** The app is light-only. Components read colors through this hook so a dark palette can be added in one place. */
export function useTheme() {
  return Colors;
}
