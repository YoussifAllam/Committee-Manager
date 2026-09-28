import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { ReminderCard } from '@/features/reminders/reminder-card';
import { useReminders } from '@/features/reminders/reminders-store';
import { sortByNextAlert } from '@/features/reminders/schedule';
import { useTheme } from '@/hooks/use-theme';

/** The member's private reminders. Not tied to a committee, so there is no committee filter. */
export default function RemindersScreen() {
  const theme = useTheme();
  const { reminders } = useReminders();

  return (
    <FlatList
      data={sortByNextAlert(reminders)}
      keyExtractor={(reminder) => reminder.id}
      renderItem={({ item }) => <ReminderCard reminder={item} />}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <PageHeader
          title="فكّرني — التذكيرات الشخصية"
          subtitle="جدولة تنبيهات دورية وشخصية لتنظيم مهامك واجتماعاتك ومواعيدك الخاصة."
          badge={<Chip tone="info" icon="lock" label="خاص بك" />}>
          <Button label="إضافة تذكير جديد" icon="add" onPress={() => router.push('/reminders/new')} />
        </PageHeader>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
            <Icon name="notification_add" size={28} color={theme.primary} />
          </View>
          <ThemedText type="heading">لا توجد تذكيرات بعد</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            أضف تذكيرًا لموعد أو مهمة، وحدد متى يصلك التنبيه.
          </ThemedText>
        </View>
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
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
