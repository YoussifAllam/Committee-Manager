import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { Meeting } from '@/features/meetings/types';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown, formatTime, monthName, weekdayName } from '@/utils/date';

/** Compact next-meeting row; shows `emptyText` when there is no upcoming meeting. */
export function MeetingSummaryCard({
  meeting,
  label,
  emptyText,
}: {
  meeting?: Meeting;
  label: string;
  emptyText: string;
}) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>

      {meeting ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/meetings/${meeting.id}`)}
          style={styles.row}>
          <View style={[styles.dateBox, { backgroundColor: theme.primarySoft }]}>
            <ThemedText style={[styles.day, { color: theme.primary }]}>{meeting.startsAt.getDate()}</ThemedText>
            <ThemedText type="caption" themeColor="primary">
              {monthName(meeting.startsAt)}
            </ThemedText>
          </View>

          <View style={styles.info}>
            <ThemedText type="label" numberOfLines={1}>
              {meeting.title}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {weekdayName(meeting.startsAt)} · {formatTime(meeting.startsAt)} · {formatCountdown(meeting.startsAt)}
            </ThemedText>
          </View>

          <Icon name="chevron_left" size={20} />
        </Pressable>
      ) : (
        <ThemedText themeColor="textSecondary">{emptyText}</ThemedText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  dateBox: {
    width: 52,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  day: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
});
