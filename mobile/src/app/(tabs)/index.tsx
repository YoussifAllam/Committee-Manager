import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ScreenTitle } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { useAssignments } from '@/features/assignments/assignments-store';
import { AssignmentsSummary } from '@/features/assignments/assignments-summary';
import { needingAttention, summarize } from '@/features/assignments/selectors';
import { useSelectedCommittee } from '@/features/committees/selected-committee';
import { MeetingSummaryCard } from '@/features/meetings/meeting-summary-card';
import { NextMeetingCard } from '@/features/meetings/next-meeting-card';
import { upcomingMeetings } from '@/features/meetings/schedule';
import { useTheme } from '@/hooks/use-theme';
import { currentUser, meetings } from '@/mocks/data';
import { greeting } from '@/utils/date';

export default function HomeScreen() {
  const theme = useTheme();
  const { committees, committee: selectedCommittee } = useSelectedCommittee();
  const { assignments } = useAssignments();
  const upcoming = upcomingMeetings(meetings);
  const nextOverall = upcoming[0];
  const nextInSelected = upcoming.find((meeting) => meeting.committee.id === selectedCommittee.id);
  // Assignments follow the committee picked in the app bar; meetings above also show the soonest overall.
  const committeeAssignments = assignments.filter((assignment) => assignment.committee.id === selectedCommittee.id);
  const attention = needingAttention(committeeAssignments);
  // Skip the second card when the soonest meeting overall already belongs to the selected committee.
  const showSelectedCommittee = nextOverall && nextInSelected?.id !== nextOverall.id;

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={`${greeting()}، ${currentUser.name.split(' ')[0]}`}
        badge={<Chip tone="info" icon="shield_person" label={selectedCommittee.role} />}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title">الاجتماعات القادمة</ThemedText>
          <SeeAllLink href="/meetings" label="كل الاجتماعات" />
        </View>
        {nextOverall ? (
          <NextMeetingCard
            meeting={nextOverall}
            label={committees.length > 1 ? 'الأقرب في كل لجانك' : 'الاجتماع القادم'}
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
        <AssignmentsSummary stats={summarize(committeeAssignments)} />
      </View>

      <View style={styles.section}>
        <ThemedText type="title">التكليفات الجارية والعاجلة</ThemedText>
        {attention.length === 0 && (
          <ThemedText themeColor="textSecondary">لا توجد تكليفات عاجلة أو متأخرة.</ThemedText>
        )}
        {attention.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
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
    padding: Spacing.three,
    paddingBottom: Spacing.four,
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
