import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { ReminderCard } from '@/features/reminders/reminder-card';
import { useReminders } from '@/features/reminders/reminders-store';
import { sortByNextAlert } from '@/features/reminders/schedule';
import { useTheme } from '@/hooks/use-theme';

/** The member's private reminders. Not tied to a committee, so there is no committee filter. */
export default function RemindersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { reminders } = useReminders();

  return (
    <FlatList
      data={sortByNextAlert(reminders)}
      keyExtractor={(reminder) => reminder.id}
      renderItem={({ item }) => <ReminderCard reminder={item} />}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <ThemedText type="display">فكّرني</ThemedText>
              <Chip icon="lock" label="خاص بك" />
            </View>
            <ThemedText themeColor="textSecondary">
              تذكيرات شخصية لمتابعة مهامك واجتماعاتك ومواعيدك، ولا يراها أحد غيرك.
            </ThemedText>
          </View>
          <Button label="إضافة تذكير" icon="add" onPress={() => router.push('/reminders/new')} />
        </View>
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
    paddingBottom: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  header: {
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
