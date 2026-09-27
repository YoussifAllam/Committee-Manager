import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { AssignmentStats } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';

export function AssignmentsSummary({ stats }: { stats: AssignmentStats }) {
  const theme = useTheme();
  const total = stats.pending + stats.completed;
  const progress = total ? stats.completed / total : 0;
  const divider = <View style={[styles.divider, { backgroundColor: theme.border }]} />;

  return (
    <Card>
      <View style={styles.stats}>
        <Stat value={stats.pending} label="مطلوبة" color={theme.primary} />
        {divider}
        <Stat value={stats.overdue} label="متأخرة" color={stats.overdue ? theme.danger : theme.text} />
        {divider}
        <Stat value={stats.completed} label="مكتملة" color={theme.success} />
      </View>

      <View style={styles.progress}>
        <View style={[styles.track, { backgroundColor: theme.surfaceMuted }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: theme.success }]} />
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          أنجزت {stats.completed} من {total}
        </ThemedText>
      </View>
    </Card>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={[styles.value, { color }]}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 40,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
