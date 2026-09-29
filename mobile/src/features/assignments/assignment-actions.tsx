import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
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
  /** Asks for details first; they're added to the timeline line ("يوجد عائق: …"). */
  details?: { label: string; placeholder: string; submit: string };
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
    event: 'يوجد عائق',
    toast: 'تم تسجيل العائق.',
    details: { label: 'ما هو العائق؟', placeholder: 'مثال: لم يرد مدير المسجد حتى الآن', submit: 'تسجيل العائق' },
  },
  {
    label: 'أحتاج تمديد الموعد',
    icon: 'more_time',
    tone: 'violet',
    event: 'طلب تمديد الموعد النهائي',
    toast: 'تم إرسال طلب تمديد الموعد.',
  },
];

/**
 * The assignee's quick updates as a 2×2 grid; the tile matching the current status is outlined.
 * `onAskingChange` tells the screen while a details form is open, so it can hide other inputs.
 */
export function AssignmentActions({
  assignment,
  onDone,
  onAskingChange,
}: {
  assignment: Assignment;
  onDone?: () => void;
  onAskingChange?: (asking: boolean) => void;
}) {
  const theme = useTheme();
  const { update } = useAssignments();
  const showToast = useToast();
  const [asking, setAskingState] = useState<Action | null>(null);
  const setAsking = (action: Action | null) => {
    setAskingState(action);
    onAskingChange?.(action !== null);
  };

  const report = (action: Action, details?: string) => {
    update(assignment.id, { event: details ? `${action.event}: ${details}` : action.event, status: action.status });
    showToast({ tone: 'success', message: action.toast });
    setAsking(null);
    onDone?.();
  };

  if (asking?.details) {
    return <DetailsForm action={asking} onSubmit={(details) => report(asking, details)} onBack={() => setAsking(null)} />;
  }

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
            onPress={() => (action.details ? setAsking(action) : report(action))}
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

/** The written details an action requires; can't be submitted empty. */
function DetailsForm({
  action,
  onSubmit,
  onBack,
}: {
  action: Action;
  onSubmit: (details: string) => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [tried, setTried] = useState(false);
  const details = action.details!;
  const missing = !text.trim();

  return (
    <View style={styles.form}>
      <View style={styles.formTitle}>
        <Icon name={action.icon} size={20} color={theme[action.tone]} />
        <ThemedText type="label">
          {details.label}
          <ThemedText type="label" themeColor="danger">
            {' '}
            *
          </ThemedText>
        </ThemedText>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={details.placeholder}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={details.label}
        autoFocus
        multiline
        maxLength={500}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: tried && missing ? theme.danger : theme.border,
            color: theme.text,
          },
        ]}
      />
      {tried && missing && (
        <ThemedText type="caption" themeColor="danger">
          اكتب العائق قبل التسجيل.
        </ThemedText>
      )}
      <View style={styles.formButtons}>
        <Button
          label={details.submit}
          icon="check"
          onPress={() => {
            setTried(true);
            if (!missing) onSubmit(text.trim());
          }}
          style={styles.grow}
        />
        <Button label="رجوع" variant="tonal" onPress={onBack} />
      </View>
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
  form: {
    gap: Spacing.two,
  },
  formTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  input: {
    minHeight: 96,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.md,
    borderWidth: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
});
