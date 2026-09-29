import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ScreenTitle } from '@/components/page-header';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { completedAssignments, openAssignments } from '@/features/assignments/selectors';
import { useSelectedCommittee } from '@/features/committees/selected-committee';
import { useTheme } from '@/hooks/use-theme';
import { assignments } from '@/mocks/data';

type Status = 'open' | 'completed';

/** The member's assignments in the committee selected in the app bar. */
export default function AssignmentsScreen() {
  const theme = useTheme();
  const { committee } = useSelectedCommittee();
  const [status, setStatus] = useState<Status>('open');
  const inCommittee = assignments.filter((assignment) => assignment.committee.id === committee.id);
  const open = openAssignments(inCommittee);
  const completed = completedAssignments(inCommittee);
  const showCompleted = status === 'completed';

  return (
    <FlatList
      data={showCompleted ? completed : open}
      keyExtractor={(assignment) => assignment.id}
      renderItem={({ item }) => <AssignmentCard assignment={item} />}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenTitle title="التكليفات" />
          <SegmentedControl
            segments={[
              { value: 'open', label: 'الحالية', count: open.length },
              { value: 'completed', label: 'المكتملة', count: completed.length },
            ]}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {showCompleted
            ? `لم تُكمل أي تكليف في ${committee.name} بعد.`
            : `لا توجد تكليفات مفتوحة لك في ${committee.name}.`}
        </ThemedText>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
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
