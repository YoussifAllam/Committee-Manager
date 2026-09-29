import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { InfoRow } from '@/components/info-row';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { DeleteReminderDialog } from '@/features/reminders/delete-reminder-dialog';
import {
  describeEnd,
  describeRepeat,
  displayStatus,
  nextOccurrence,
  parseDateKey,
} from '@/features/reminders/recurrence';
import { alertProblem, formatAlertDay, ReminderStatusChip } from '@/features/reminders/reminder-status';
import { useReminders } from '@/features/reminders/reminders-store';
import { useToggleReminder } from '@/features/reminders/use-toggle-reminder';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, formatMinutes, formatTime } from '@/utils/date';

const formatMoment = (date: Date) => `${formatAlertDay(date)} · ${formatTime(date)}`;

/** One reminder in plain words; also where a tap on its notification lands. */
export default function ReminderDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, loading, permission } = useReminders();
  const toggle = useToggleReminder();
  const [deleting, setDeleting] = useState(false);
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return (
      <Screen>
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <ThemedText themeColor="textSecondary">هذا التذكير لم يعد موجودًا.</ThemedText>
        )}
      </Screen>
    );
  }

  const status = displayStatus(reminder);
  const next = status === 'ended' ? undefined : nextOccurrence(reminder);
  const problem = alertProblem(reminder, permission);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.grow}>
            {reminder.title}
          </ThemedText>
          <ReminderStatusChip reminder={reminder} />
        </View>
        <ThemedText themeColor={reminder.message ? 'text' : 'textSecondary'}>
          {reminder.message || 'بدون رسالة.'}
        </ThemedText>
      </Card>

      {problem && (
        <View style={[styles.problem, { backgroundColor: theme.warningSoft }]}>
          <Icon name="warning" size={18} color={theme.warning} />
          <ThemedText type="small" themeColor="warning" style={styles.grow}>
            {problem}
          </ThemedText>
        </View>
      )}

      <Card style={styles.rows}>
        <InfoRow
          icon="notifications_active"
          label="التنبيه القادم"
          value={next ? formatMoment(next) : status === 'paused' ? 'متوقف حتى تعيد تفعيله' : 'لا توجد مواعيد قادمة'}
        />
        <InfoRow icon="repeat" label="التكرار" value={describeRepeat(reminder)} />
        <InfoRow icon="calendar_today" label="تاريخ البدء" value={formatLongDate(parseDateKey(reminder.startDate))} />
        {reminder.repeatType !== 'none' && <InfoRow icon="event" label="نهاية التكرار" value={describeEnd(reminder)} />}
        <InfoRow icon="snooze" label="ذكّرني لاحقًا" value={`بعد ${formatMinutes(reminder.snoozeMinutes)}`} />
        <InfoRow
          icon="history"
          label="آخر تنبيه"
          value={reminder.lastTriggeredAt ? formatMoment(new Date(reminder.lastTriggeredAt)) : 'لم يصلك تنبيه بعد'}
          last
        />
      </Card>

      <View style={styles.buttons}>
        <Button label="تعديل" icon="edit" onPress={() => router.push(`/reminders/${reminder.id}/edit`)} />
        {status !== 'ended' && (
          <Button
            label={reminder.isEnabled ? 'إيقاف التذكير' : 'تفعيل التذكير'}
            icon={reminder.isEnabled ? 'pause_circle' : 'play_circle'}
            variant="tonal"
            onPress={() => toggle(reminder.id, !reminder.isEnabled)}
          />
        )}
        <Button label="حذف" icon="delete" variant="danger" onPress={() => setDeleting(true)} />
      </View>

      <DeleteReminderDialog
        reminderId={reminder.id}
        visible={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  problem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.md,
  },
  rows: {
    gap: 0,
    paddingVertical: Spacing.one,
  },
  buttons: {
    gap: Spacing.two,
  },
});
