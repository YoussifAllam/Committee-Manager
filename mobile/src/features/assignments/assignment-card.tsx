import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing, type Tone } from '@/constants/theme';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';
import { daysFromToday, formatDays, formatShortDate } from '@/utils/date';

type ChipSpec = { label: string; icon: IconName; tone: Tone };

const STATUS: Record<AssignmentStatus, ChipSpec> = {
  not_started: { label: 'لم يبدأ', icon: 'radio_button_unchecked', tone: 'neutral' },
  in_progress: { label: 'جاري التنفيذ', icon: 'progress_activity', tone: 'info' },
  awaiting_review: { label: 'بانتظار المراجعة', icon: 'hourglass_top', tone: 'violet' },
  done: { label: 'مكتمل', icon: 'check_circle', tone: 'success' },
};

// Normal priority gets no chip, so only the exceptions draw attention.
const PRIORITY: Record<Exclude<AssignmentPriority, 'normal'>, ChipSpec> = {
  important: { label: 'مهم', icon: 'priority_high', tone: 'warning' },
  urgent: { label: 'عاجل', icon: 'local_fire_department', tone: 'danger' },
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const theme = useTheme();
  const { dueDate, priority } = assignment;
  const daysLeft = daysFromToday(dueDate);
  const isOverdue = daysLeft < 0 && assignment.status !== 'done';
  const dueColor = isOverdue ? theme.danger : theme.textSecondary;

  return (
    <Card style={styles.card}>
      {isOverdue && <View style={[styles.overdueEdge, { backgroundColor: theme.danger }]} />}

      <View style={styles.chips}>
        <Chip {...STATUS[assignment.status]} />
        {priority !== 'normal' && <Chip {...PRIORITY[priority]} />}
      </View>

      <View style={styles.body}>
        <ThemedText type="heading">{assignment.title}</ThemedText>
        <View style={styles.row}>
          <Icon name="event" size={16} color={dueColor} />
          <ThemedText type="small" style={{ color: dueColor }}>
            {isOverdue
              ? `متأخر ${formatDays(-daysLeft)} · ${formatShortDate(dueDate)}`
              : `الموعد النهائي ${formatShortDate(dueDate)}`}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={[styles.row, styles.shrink]}>
          <Icon name="groups" size={16} />
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1} style={styles.shrink}>
            {assignment.meetingTitle}
          </ThemedText>
        </View>
        <Button label="تحديث سريع" icon="edit" variant="tonal" compact />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three - Spacing.one,
  },
  overdueEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 0,
    width: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  body: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  shrink: {
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three - Spacing.one,
    paddingTop: Spacing.three - Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
