import { Link, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { AssignmentsSummary } from '@/features/assignments/assignments-summary';
import { HomeHeader } from '@/features/home/home-header';
import { NextMeetingCard } from '@/features/meetings/next-meeting-card';
import { useTheme } from '@/hooks/use-theme';
import { assignmentStats, committee, currentUser, nextMeeting, urgentAssignments } from '@/mocks/home';

export default function HomeScreen() {
  const theme = useTheme();

  // The header is dark in both themes, so status bar icons stay light while this tab is focused.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <HomeHeader
        userName={currentUser.name}
        role={currentUser.role}
        committeeName={committee.name}
        unreadNotifications={committee.unreadNotifications}
      />

      <View style={styles.body}>
        <NextMeetingCard meeting={nextMeeting} style={styles.overlapHeader} />

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
  overlapHeader: {
    marginTop: -(Spacing.five + Spacing.two),
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
