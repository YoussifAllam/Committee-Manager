import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { AssignmentsSummary } from '@/features/assignments/assignments-summary';
import { HomeHeader } from '@/features/home/home-header';
import { NextMeetingCard } from '@/features/meetings/next-meeting-card';
import { useTheme } from '@/hooks/use-theme';
import { assignmentStats, committees, currentUser, nextMeeting, unreadNotifications, urgentAssignments } from '@/mocks/home';

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedCommittee, setSelectedCommittee] = useState(committees[0]);

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
        <NextMeetingCard meeting={nextMeeting} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title">ملخص تكليفاتي</ThemedText>
            <Link href="/assignments" asChild>
              <Pressable accessibilityRole="link" hitSlop={Spacing.two} style={styles.seeAll}>
                <ThemedText type="label" themeColor="primary">
                  كل التكليفات
                </ThemedText>
                <Icon name="chevron_left" size={18} color={theme.primary} />
              </Pressable>
            </Link>
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
