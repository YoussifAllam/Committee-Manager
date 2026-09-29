import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Segment<T extends string> = { value: T; label: string; count?: number };

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (segment.value !== value) Haptics.selectionAsync().catch(() => {});
              onChange(segment.value);
            }}
            style={[styles.segment, selected && [styles.selected, { backgroundColor: theme.surface }]]}>
            <ThemedText type="label" themeColor={selected ? 'primary' : 'textSecondary'}>
              {segment.label}
            </ThemedText>
            {segment.count !== undefined && (
              <View style={[styles.count, { backgroundColor: selected ? theme.primarySoft : theme.border }]}>
                <ThemedText style={[styles.countText, { color: selected ? theme.primary : theme.textSecondary }]}>
                  {segment.count}
                </ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Radius.md + Spacing.one,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 44,
    borderRadius: Radius.md,
  },
  selected: {
    boxShadow: '0 1px 3px rgba(8, 48, 44, 0.1)',
  },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: Spacing.one + Spacing.half,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
});
