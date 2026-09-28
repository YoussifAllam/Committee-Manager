import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useReminders } from '@/features/reminders/reminders-store';
import { describeRepeat, nextOccurrence } from '@/features/reminders/schedule';
import type { Reminder } from '@/features/reminders/types';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, formatTime } from '@/utils/date';

export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const theme = useTheme();
  const { remove, setEnabled } = useReminders();
  const next = nextOccurrence(reminder);

  let status: { icon: IconName; text: string; color: string } = {
    icon: 'event_busy',
    text: 'انتهت مواعيد هذا التذكير',
    color: theme.textSecondary,
  };
  if (!reminder.enabled) {
    status = { icon: 'notifications_off', text: 'التذكير متوقف', color: theme.textSecondary };
  } else if (next) {
    status = {
      icon: 'notifications_active',
      text: `التنبيه القادم: ${formatLongDate(next)} · ${formatTime(next)}`,
      color: theme.primary,
    };
  }

  const confirmDelete = () =>
    Alert.alert('حذف التذكير؟', `سيُحذف «${reminder.title}» نهائيًا.`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => remove(reminder.id) },
    ]);

  return (
    <Card>
      <View style={styles.header}>
        <View style={[styles.text, !reminder.enabled && styles.dimmed]}>
          <ThemedText type="heading">{reminder.title}</ThemedText>
          {reminder.message !== '' && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {reminder.message}
            </ThemedText>
          )}
        </View>
        <Switch
          accessibilityLabel={reminder.enabled ? 'إيقاف التذكير' : 'تشغيل التذكير'}
          value={reminder.enabled}
          onValueChange={(enabled) => setEnabled(reminder.id, enabled)}
          trackColor={{ true: theme.primary, false: theme.border }}
          thumbColor={theme.surface}
        />
      </View>

      <View style={styles.row}>
        <Icon name={status.icon} size={16} color={status.color} />
        <ThemedText type="small" style={[styles.shrink, { color: status.color }]}>
          {status.text}
        </ThemedText>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.shrink}>
          <Chip icon="repeat" label={describeRepeat(reminder.repeat)} />
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تعديل التذكير"
            hitSlop={Spacing.one}
            onPress={() => router.push(`/reminders/${reminder.id}`)}
            style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
            <Icon name="edit" size={18} color={theme.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="حذف التذكير"
            hitSlop={Spacing.one}
            onPress={confirmDelete}
            style={[styles.iconButton, { backgroundColor: theme.dangerSoft }]}>
            <Icon name="delete" size={18} color={theme.danger} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three - Spacing.one,
  },
  text: {
    flex: 1,
    gap: Spacing.one,
  },
  dimmed: {
    opacity: 0.55,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
