import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ReminderForm } from '@/features/reminders/reminder-form';
import { useReminders } from '@/features/reminders/reminders-store';

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminder = useReminders().reminders.find((r) => r.id === id);

  if (!reminder) {
    return (
      <Screen>
        <ThemedText themeColor="textSecondary">هذا التذكير لم يعد موجودًا.</ThemedText>
      </Screen>
    );
  }
  return <ReminderForm reminder={reminder} />;
}
