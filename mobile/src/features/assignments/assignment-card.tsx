import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing, type Tone } from '@/constants/theme';
import { isDone } from '@/features/assignments/selectors';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';
import { formatTimeAgo } from '@/utils/date';

// Gray not started, blue in progress, amber waiting on someone else, green done.
const STATUS: Record<AssignmentStatus, { label: string; icon: IconName; tone: Tone }> = {
  not_started: { label: 'لم يبدأ', icon: 'radio_button_unchecked', tone: 'neutral' },
  in_progress: { label: 'جاري التنفيذ', icon: 'schedule', tone: 'info' },
  awaiting_review: { label: 'بانتظار المراجعة', icon: 'hourglass_top', tone: 'warning' },
  done: { label: 'مكتمل', icon: 'check_circle', tone: 'success' },
};

// Normal priority shows nothing, so only the exceptions are mentioned.
const PRIORITY: Record<Exclude<AssignmentPriority, 'normal'>, string> = {
  important: 'مهم',
  urgent: 'عاجل',
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const theme = useTheme();
  const { priority } = assignment;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="عرض تفاصيل التكليف"
      onPress={() => router.push(`/assignments/${assignment.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Chip {...STATUS[assignment.status]} outlined />
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

        <View style={styles.row}>
          <Icon name="update" size={16} />
          <ThemedText type="caption" themeColor="textSecondary">
            آخر تحديث {formatTimeAgo(assignment.updatedAt)}
          </ThemedText>
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
  priority: {
    fontFamily: Fonts.bold,
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
