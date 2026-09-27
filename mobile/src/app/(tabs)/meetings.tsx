import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { MeetingCard } from '@/features/meetings/meeting-card';
import { pastMeetings, upcomingMeetings } from '@/features/meetings/schedule';
import { useTheme } from '@/hooks/use-theme';
import { meetings } from '@/mocks/data';

type Period = 'upcoming' | 'past';

/** Every meeting from every committee the member belongs to; there is no committee filter here. */
export default function MeetingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('upcoming');
  const upcoming = upcomingMeetings(meetings);
  const past = pastMeetings(meetings);
  const isPast = period === 'past';

  return (
    <FlatList
      data={isPast ? past : upcoming}
      keyExtractor={(meeting) => meeting.id}
      renderItem={({ item }) => <MeetingCard meeting={item} isPast={isPast} />}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <ThemedText type="display">الاجتماعات</ThemedText>
            <ThemedText themeColor="textSecondary">مواعيد اجتماعات كل لجانك ونتائج ما انعقد منها.</ThemedText>
          </View>
          <SegmentedControl
            segments={[
              { value: 'upcoming', label: 'القادمة', count: upcoming.length },
              { value: 'past', label: 'السابقة', count: past.length },
            ]}
            value={period}
            onChange={setPeriod}
          />
        </View>
      }
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {isPast ? 'لم ينعقد أي اجتماع بعد.' : 'لا توجد اجتماعات قادمة في أي من لجانك.'}
        </ThemedText>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  header: {
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
