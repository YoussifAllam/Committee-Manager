import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Meeting } from '@/features/meetings/types';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown, formatLongDate, formatTime } from '@/utils/date';
import { pluralize } from '@/utils/plural';

const STATS = [
  { key: 'agendaCount', icon: 'format_list_numbered', forms: { one: 'بند واحد', two: 'بندان', few: 'بنود', many: 'بندًا' } },
  { key: 'decisionCount', icon: 'gavel', forms: { one: 'قرار واحد', two: 'قراران', few: 'قرارات', many: 'قرارًا' } },
  { key: 'assignmentCount', icon: 'assignment', forms: { one: 'تكليف واحد', two: 'تكليفان', few: 'تكليفات', many: 'تكليفًا' } },
] as const;

/** A meeting in the list. Upcoming meetings show their agenda; held ones also show what came out of them. */
export function MeetingCard({ meeting, isPast }: { meeting: Meeting; isPast: boolean }) {
  const theme = useTheme();
  const { startsAt } = meeting;
  // Zero counts are hidden, so an upcoming meeting doesn't list "0 decisions".
  const stats = STATS.filter((stat) => meeting[stat.key] > 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="عرض تفاصيل الاجتماع"
      onPress={() => router.push(`/meetings/${meeting.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <View style={styles.topRow}>
          <View style={[styles.row, styles.shrink]}>
            <Icon name="groups" size={16} color={theme.primary} />
            <ThemedText type="small" themeColor="primary" numberOfLines={1} style={styles.shrink}>
              {meeting.committee.name}
            </ThemedText>
          </View>
          <Chip
            tone={isPast ? 'neutral' : 'success'}
            icon={isPast ? 'history' : 'schedule'}
            label={formatCountdown(startsAt)}
          />
        </View>

        <View style={styles.body}>
          <ThemedText type="heading">{meeting.title}</ThemedText>
          <View style={styles.row}>
            <Icon name="event" size={16} />
            <ThemedText type="small" themeColor="textSecondary">
              {formatLongDate(startsAt)} · {formatTime(startsAt)}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <Icon name="location_on" size={16} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.shrink}>
              {meeting.location}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <View style={styles.stats}>
            {stats.map((stat) => (
              <View key={stat.icon} style={[styles.stat, { backgroundColor: theme.surfaceMuted }]}>
                <Icon name={stat.icon} size={14} />
                <ThemedText type="caption" themeColor="textSecondary">
                  {pluralize(meeting[stat.key], stat.forms)}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <ThemedText type="small" themeColor="primary">
              عرض التفاصيل
            </ThemedText>
            <Icon name="chevron_left" size={18} color={theme.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: Spacing.two,
    paddingTop: Spacing.three - Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
});
