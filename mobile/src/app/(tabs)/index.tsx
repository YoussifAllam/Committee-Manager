import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { AssignmentsSummary } from '@/features/assignments/assignments-summary';
import { HomeHeader } from '@/features/home/home-header';
import { MeetingSummaryCard } from '@/features/meetings/meeting-summary-card';
import { findNextMeeting } from '@/features/meetings/next-meeting';
import { NextMeetingCard } from '@/features/meetings/next-meeting-card';
import { useTheme } from '@/hooks/use-theme';
import {
  assignmentStats,
  committees,
  currentUser,
  meetings,
  unreadNotifications,
  urgentAssignments,
} from '@/mocks/home';

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedCommittee, setSelectedCommittee] = useState(committees[0]);
  const nextOverall = findNextMeeting(meetings);
  const nextInSelected = findNextMeeting(meetings, selectedCommittee.id);
  // Skip the second card when the soonest meeting overall already belongs to the selected committee.
  const showSelectedCommittee = nextOverall && nextInSelected?.id !== nextOverall.id;

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <HomeHeader
        userName={currentUser.name}
        committees={committees}
        selectedCommittee={selectedCommittee}
        onSelectCommittee={setSelectedCommittee}
        unreadNotifications={unreadNotifications}
      />

      <View style={styles.body}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title">الاجتماعات القادمة</ThemedText>
            <SeeAllLink href="/meetings" label="كل الاجتماعات" />
          </View>
          {nextOverall ? (
            <NextMeetingCard
              meeting={nextOverall}
              label={committees.length > 1 ? 'الأقرب في كل لجانك' : 'الاجتماع القادم'}
              committeeName={committees.find((c) => c.id === nextOverall.committeeId)?.name ?? ''}
            />
          ) : (
            <ThemedText themeColor="textSecondary">لا توجد اجتماعات قادمة.</ThemedText>
          )}
          {showSelectedCommittee && (
            <MeetingSummaryCard
              meeting={nextInSelected}
              label={`الأقرب في ${selectedCommittee.name}`}
              emptyText={`لا توجد اجتماعات قادمة في ${selectedCommittee.name}.`}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title">ملخص تكليفاتي</ThemedText>
            <SeeAllLink href="/assignments" label="كل التكليفات" />
          </View>
          <AssignmentsSummary stats={assignmentStats} />
        </View>

        <View style={styles.section}>
          <ThemedText type="title">التكليفات الجارية والعاجلة</ThemedText>
          {urgentAssignments.length === 0 && (
            <ThemedText themeColor="textSecondary">لا توجد تكليفات جارية أو متأخرة.</ThemedText>
          )}
          {urgentAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SeeAllLink({ href, label }: { href: Href; label: string }) {
  const theme = useTheme();

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" hitSlop={Spacing.two} style={styles.seeAll}>
        <ThemedText type="label" themeColor="primary">
          {label}
        </ThemedText>
        <Icon name="chevron_left" size={18} color={theme.primary} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.four,
  },
  body: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.three - Spacing.one,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
