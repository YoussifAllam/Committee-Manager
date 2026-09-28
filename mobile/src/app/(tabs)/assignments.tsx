import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AssignmentCard } from '@/features/assignments/assignment-card';
import { completedAssignments, openAssignments } from '@/features/assignments/selectors';
import { CommitteePicker } from '@/features/committees/committee-picker';
import { useSelectedCommittee } from '@/features/committees/selected-committee';
import { useTheme } from '@/hooks/use-theme';
import { assignments } from '@/mocks/data';

type Status = 'open' | 'completed';

/** The member's assignments in the selected committee (the same committee chosen on the home screen). */
export default function AssignmentsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <PageHeader title="التكليفات" subtitle="متابعة إنجاز مهامك الناتجة عن الاجتماعات وتحديث حالاتها.">
            <CommitteePicker />
          </PageHeader>
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
