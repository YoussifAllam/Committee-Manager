import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { isDone } from '@/features/assignments/selectors';
import { PRIORITY, STATUS } from '@/features/assignments/status';
import { AssignmentActionsSheet } from '@/features/assignments/assignment-actions';
import type { Assignment } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';
import { formatTimeAgo } from '@/utils/date';

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const theme = useTheme();
  const { priority } = assignment;
  const [updating, setUpdating] = useState(false);

  return (
    <>
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
            {!isDone(assignment) && (
              <Button label="تحديث سريع" icon="edit" variant="tonal" compact onPress={() => setUpdating(true)} />
            )}
          </View>
        </Card>
      </Pressable>
      <AssignmentActionsSheet assignment={assignment} visible={updating} onClose={() => setUpdating(false)} />
    </>
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
