import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { Meeting } from '@/features/meetings/types';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown, formatTime, monthName, weekdayName } from '@/utils/date';

const NOTCH_SIZE = 22;

type NextMeetingCardProps = {
  meeting: Meeting;
  /** Says which meetings this one was picked from, e.g. "الأقرب في كل لجانك". */
  label: string;
  committeeName: string;
};

/** The next meeting as an invitation ticket: details above the tear line, actions below it. */
export function NextMeetingCard({ meeting, label, committeeName }: NextMeetingCardProps) {
  const theme = useTheme();
  const { startsAt } = meeting;
  const notchColors = { backgroundColor: theme.background, borderColor: theme.border };

  return (
    <Card style={styles.ticket}>
      <View style={styles.details}>
        <View style={styles.eyebrow}>
          <ThemedText type="small" themeColor="textSecondary">
            {label}
          </ThemedText>
          <Chip tone="success" icon="schedule" label={formatCountdown(startsAt)} />
        </View>

        <View style={styles.main}>
          <View style={[styles.dateSeal, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="caption" themeColor="textSecondary">
              {weekdayName(startsAt)}
            </ThemedText>
            <ThemedText style={[styles.sealDay, { color: theme.primary }]}>{startsAt.getDate()}</ThemedText>
            <ThemedText type="caption" themeColor="primary">
              {monthName(startsAt)}
            </ThemedText>
          </View>

          <View style={styles.info}>
            <ThemedText type="heading">{meeting.title}</ThemedText>
            <View style={styles.row}>
              <Icon name="schedule" size={16} />
              <ThemedText type="small" themeColor="textSecondary">
                {formatTime(startsAt)}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <Icon name="location_on" size={16} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.shrink}>
                {meeting.location}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <Icon name="groups" size={16} color={theme.primary} />
              <ThemedText type="small" themeColor="primary" style={styles.shrink}>
                {committeeName}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tearLine}>
        <View style={[styles.notch, styles.notchStart, notchColors]} />
        <View style={styles.dashClip}>
          <View style={[styles.dashes, { borderColor: theme.border }]} />
        </View>
        <View style={[styles.notch, styles.notchEnd, notchColors]} />
      </View>

      <View style={styles.actions}>
        <Button
          label={`جدول الأعمال (${meeting.agendaCount})`}
          icon="format_list_numbered"
          onPress={() => router.push(`/meetings/${meeting.id}`)}
          style={styles.grow}
        />
        <Button label="تقديم مقترح" icon="lightbulb" variant="tonal" style={styles.grow} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  ticket: {
    padding: 0,
    gap: 0,
  },
  details: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dateSeal: {
    width: 72,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  sealDay: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 38,
  },
  info: {
    flex: 1,
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
  grow: {
    flex: 1,
  },
  tearLine: {
    height: NOTCH_SIZE,
    justifyContent: 'center',
  },
  notch: {
    position: 'absolute',
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    borderWidth: 1,
  },
  notchStart: {
    start: -NOTCH_SIZE / 2,
  },
  notchEnd: {
    end: -NOTCH_SIZE / 2,
  },
  // Android draws single-side dashed borders solid, so clip a fully dashed box down to its top edge.
  dashClip: {
    height: 1,
    marginHorizontal: NOTCH_SIZE,
    overflow: 'hidden',
  },
  dashes: {
    height: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    paddingTop: Spacing.two,
  },
});
