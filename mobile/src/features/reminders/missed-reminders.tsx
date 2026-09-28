import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Spacing } from '@/constants/theme';
import { deliveryToast } from '@/features/reminders/delivery-toast';
import { isSchedulable } from '@/features/reminders/recurrence';
import { formatAlertDay } from '@/features/reminders/reminder-status';
import { useReminders } from '@/features/reminders/reminders-store';
import type { Reminder } from '@/features/reminders/types';
import { useTheme } from '@/hooks/use-theme';
import { formatMinutes, formatTime } from '@/utils/date';

/** "تذكيرات فائتة": occurrences that passed without an alert reaching the member. Hidden when there are none. */
export function MissedReminders({ reminders }: { reminders: Reminder[] }) {
  const theme = useTheme();
  const missed = reminders.filter((reminder) => reminder.missedAt && isSchedulable(reminder));
  if (missed.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Icon name="history" color={theme.warning} />
        <ThemedText type="title">تذكيرات فائتة</ThemedText>
      </View>
      {missed.map((reminder) => (
        <MissedItem key={reminder.id} reminder={reminder} />
      ))}
    </View>
  );
}

function MissedItem({ reminder }: { reminder: Reminder }) {
  const theme = useTheme();
  const { completeMissed, snoozeMissed, dismissMissed } = useReminders();
  const showToast = useToast();
  const missedAt = new Date(reminder.missedAt ?? 0);

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch {
      showToast({ tone: 'danger', message: 'تعذر تحديث التذكير. حاول مرة أخرى.' });
    }
  };

  return (
    <Card style={[styles.card, { borderColor: theme.warningSoft }]}>
      <View style={styles.text}>
        <ThemedText type="heading">{reminder.title}</ThemedText>
        <ThemedText type="small" themeColor="warning">
          فات موعده {formatAlertDay(missedAt)} الساعة {formatTime(missedAt)}
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Button
          label="تم"
          icon="check"
          compact
          accessibilityLabel={`تم: ${reminder.title}`}
          onPress={() =>
            run(async () => {
              await completeMissed(reminder.id);
              showToast({ tone: 'success', message: 'تم تسجيل التذكير كمُنجز.' });
            })
          }
        />
        <Button
          label="ذكّرني لاحقًا"
          icon="snooze"
          variant="tonal"
          compact
          accessibilityLabel={`ذكّرني لاحقًا: ${reminder.title}`}
          onPress={() =>
            run(async () => {
              const { delivery } = await snoozeMissed(reminder.id);
              showToast(deliveryToast(delivery, `سنذكّرك بعد ${formatMinutes(reminder.snoozeMinutes)}.`));
            })
          }
        />
        <Button
          label="تجاهل"
          variant="plain"
          compact
          accessibilityLabel={`تجاهل: ${reminder.title}`}
          onPress={() => run(() => dismissMissed(reminder.id))}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three - Spacing.one,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.three - Spacing.one,
    borderWidth: 1.5,
  },
  text: {
    gap: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
