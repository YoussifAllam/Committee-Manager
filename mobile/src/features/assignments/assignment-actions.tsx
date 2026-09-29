import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Radius, Spacing } from '@/constants/theme';
import { useAssignments } from '@/features/assignments/assignments-store';
import type { Assignment, AssignmentStatus } from '@/features/assignments/types';
import { useTheme } from '@/hooks/use-theme';

type Action = {
  label: string;
  icon: IconName;
  tone: 'success' | 'info' | 'danger' | 'violet';
  /** Omitted for requests that don't change the status. */
  status?: AssignmentStatus;
  event: string;
  toast: string;
};

// What the assignee can report; each one lands in the timeline.
const ACTIONS: Action[] = [
  {
    label: 'تم التنفيذ',
    icon: 'check_circle',
    tone: 'success',
    status: 'done',
    event: 'تم تنفيذ التكليف',
    toast: 'تم تسجيل التكليف كمنفَّذ.',
  },
  {
    label: 'ما زلت أعمل عليه',
    icon: 'schedule',
    tone: 'info',
    status: 'in_progress',
    event: 'ما زال العمل جاريًا على التكليف',
    toast: 'تم تحديث الحالة إلى «جاري التنفيذ».',
  },
  {
    label: 'يوجد عائق',
    icon: 'warning',
    tone: 'danger',
    status: 'blocked',
    event: 'يوجد عائق يمنع إكمال التكليف',
    toast: 'تم تسجيل وجود عائق.',
  },
  {
    label: 'أحتاج تمديد الموعد',
    icon: 'more_time',
    tone: 'violet',
    event: 'طلب تمديد الموعد النهائي',
    toast: 'تم إرسال طلب تمديد الموعد.',
  },
];

/** The assignee's quick updates as a 2×2 grid; the tile matching the current status is outlined. */
export function AssignmentActions({ assignment, onDone }: { assignment: Assignment; onDone?: () => void }) {
  const theme = useTheme();
  const { update } = useAssignments();
  const showToast = useToast();

  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => {
        const color = theme[action.tone];
        const current = action.status === assignment.status;
        return (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityState={{ selected: current }}
            onPress={() => {
              update(assignment.id, { event: action.event, status: action.status });
              showToast({ tone: 'success', message: action.toast });
              onDone?.();
            }}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: theme[`${action.tone}Soft`],
                // `${color}55`: the tone at about a third opacity.
                borderColor: current ? color : `${color}55`,
                borderWidth: current ? 2 : 1,
              },
              pressed && styles.pressed,
            ]}>
            <Icon name={action.icon} size={22} color={color} />
            <ThemedText type="label" style={[styles.label, { color }]}>
              {action.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The same updates in a bottom sheet, for "تحديث سريع" on a card. */
export function AssignmentActionsSheet({
  assignment,
  visible,
  onClose,
}: {
  assignment: Assignment;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="تحديث الحالة">
      <ThemedText type="small" themeColor="textSecondary">
        {assignment.title}
      </ThemedText>
      <AssignmentActions assignment={assignment} onDone={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: Radius.lg,
  },
  label: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
