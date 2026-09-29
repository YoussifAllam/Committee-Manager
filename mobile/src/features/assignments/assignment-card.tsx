import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { isDone, isOverdue } from '@/features/assignments/selectors';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';
import { daysFromToday, formatDays, formatShortDate, formatTimeAgo } from '@/utils/date';

// Status is a small colored dot and plain text; the only strong color on the card is red overdue text.
const STATUS: Record<AssignmentStatus, { label: string; dot: ThemeColor }> = {
  not_started: { label: 'لم يبدأ', dot: 'textSecondary' },
  in_progress: { label: 'جاري التنفيذ', dot: 'info' },
  awaiting_review: { label: 'بانتظار المراجعة', dot: 'violet' },
  done: { label: 'مكتمل', dot: 'success' },
};

// Normal priority shows nothing, so only the exceptions are mentioned.
const PRIORITY: Record<Exclude<AssignmentPriority, 'normal'>, string> = {
  important: 'مهم',
  urgent: 'عاجل',
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const theme = useTheme();
  const { dueDate, priority } = assignment;
  const overdue = isOverdue(assignment);
  const dueColor = overdue ? theme.danger : theme.textSecondary;
  const status = STATUS[assignment.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="عرض تفاصيل التكليف"
      onPress={() => router.push(`/assignments/${assignment.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: theme[status.dot] }]} />
          <ThemedText type="caption" themeColor="textSecondary">
            {status.label}
          </ThemedText>
          {priority !== 'normal' && (
            <ThemedText type="caption" style={styles.priority}>
              · {PRIORITY[priority]}
            </ThemedText>
          )}
        </View>

        <View style={styles.body}>
          <ThemedText type="heading">{assignment.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {assignment.description}
          </ThemedText>
        </View>

        <View style={styles.meta}>
          <View style={styles.row}>
            <Icon name="event" size={16} color={dueColor} />
            <ThemedText type="small" style={{ color: dueColor }}>
              {overdue
                ? `متأخر ${formatDays(-daysFromToday(dueDate))} · ${formatShortDate(dueDate)}`
                : `الموعد النهائي ${formatShortDate(dueDate)}`}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <Icon name="update" size={16} />
            <ThemedText type="caption" themeColor="textSecondary">
              آخر تحديث {formatTimeAgo(assignment.updatedAt)}
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
          {!isDone(assignment) && <Button label="تحديث سريع" icon="edit" variant="tonal" compact />}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  card: {
    gap: Spacing.three - Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  priority: {
    fontFamily: Fonts.bold,
  },
  body: {
    gap: Spacing.one,
  },
  meta: {
    gap: Spacing.half,
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
