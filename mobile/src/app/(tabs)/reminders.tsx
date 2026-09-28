import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { MissedReminders } from '@/features/reminders/missed-reminders';
import { useEnableNotifications } from '@/features/reminders/permission-prompt';
import { displayStatus, nextOccurrence } from '@/features/reminders/recurrence';
import { ReminderCard } from '@/features/reminders/reminder-card';
import { useReminders } from '@/features/reminders/reminders-store';
import type { PermissionStatus } from '@/features/reminders/scheduler';
import type { Reminder } from '@/features/reminders/types';
import { useTheme } from '@/hooks/use-theme';
import { daysFromToday } from '@/utils/date';

type Filter = 'all' | 'today' | 'upcoming';

const EMPTY_FILTER: Record<Filter, string> = {
  all: '',
  today: 'لا توجد تنبيهات متبقية اليوم.',
  upcoming: 'لا توجد تذكيرات قادمة بعد اليوم.',
};

/** Active reminders by next alert, then stopped ones, then finished ones (latest first). */
function sortReminders(reminders: Reminder[], now: Date) {
  const rank = { active: 0, paused: 1, ended: 2 };
  return [...reminders].sort((a, b) => {
    const byStatus = rank[displayStatus(a, now)] - rank[displayStatus(b, now)];
    if (byStatus !== 0) return byStatus;
    const nextA = nextOccurrence(a, now)?.getTime() ?? 0;
    const nextB = nextOccurrence(b, now)?.getTime() ?? 0;
    return nextA !== nextB ? nextA - nextB : b.updatedAt.localeCompare(a.updatedAt);
  });
}

/** فكّرني: the member's private reminders, stored on this phone only. */
export default function RemindersScreen() {
  const theme = useTheme();
  const { reminders, loading, permission } = useReminders();
  const [filter, setFilter] = useState<Filter>('all');

  const now = new Date();
  const sorted = sortReminders(reminders, now);
  const alertDay = (reminder: Reminder) => {
    const next = displayStatus(reminder, now) === 'active' ? nextOccurrence(reminder, now) : undefined;
    return next ? daysFromToday(next) : undefined;
  };
  const lists: Record<Filter, Reminder[]> = {
    all: sorted,
    today: sorted.filter((reminder) => alertDay(reminder) === 0),
    upcoming: sorted.filter((reminder) => (alertDay(reminder) ?? 0) > 0),
  };
  const hasActive = reminders.some((reminder) => displayStatus(reminder, now) === 'active');

  return (
    <FlatList
      data={lists[filter]}
      keyExtractor={(reminder) => reminder.id}
      renderItem={({ item }) => <ReminderCard reminder={item} />}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <PageHeader
            title="فكّرني"
            subtitle="احتفظ بتذكيراتك على هاتفك واستقبلها حتى بدون إنترنت."
            badge={<HeaderActions permission={permission.status} />}
          />
          {__DEV__ && permission.status === 'unsupported' && (
            <Notice
              icon="info"
              tone="info"
              text="معاينة الويب: التذكيرات تُحفظ في هذا المتصفح، أما التنبيهات المجدولة فتعمل في تطبيق الهاتف فقط."
            />
          )}
          {hasActive && <PermissionBanner />}
          <MissedReminders reminders={reminders} />
          {reminders.length > 0 && (
            <SegmentedControl
              segments={[
                { value: 'all', label: 'الكل', count: lists.all.length },
                { value: 'today', label: 'اليوم', count: lists.today.length },
                { value: 'upcoming', label: 'القادمة', count: lists.upcoming.length },
              ]}
              value={filter}
              onChange={setFilter}
            />
          )}
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={theme.primary} style={styles.loading} />
        ) : reminders.length === 0 ? (
          <EmptyState />
        ) : (
          <ThemedText themeColor="textSecondary" style={[styles.center, styles.filterEmpty]}>
            {EMPTY_FILTER[filter]}
          </ThemedText>
        )
      }
    />
  );
}

const PERMISSION_ICON: Record<PermissionStatus, { icon: IconName; color: ThemeColor; background: ThemeColor; label: string }> = {
  granted: { icon: 'notifications_active', color: 'success', background: 'successSoft', label: 'التنبيهات مفعّلة' },
  denied: { icon: 'notifications_off', color: 'warning', background: 'warningSoft', label: 'التنبيهات غير مفعّلة' },
  undetermined: { icon: 'notifications_off', color: 'warning', background: 'warningSoft', label: 'التنبيهات غير مفعّلة' },
  unsupported: { icon: 'notifications_paused', color: 'textSecondary', background: 'surfaceMuted', label: 'التنبيهات غير متاحة هنا' },
};

/** Notification status (opens فكّرني settings) and the add button, beside the title. */
function HeaderActions({ permission }: { permission: PermissionStatus }) {
  const theme = useTheme();
  const status = PERMISSION_ICON[permission];

  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${status.label}. إعدادات فكّرني`}
        onPress={() => router.push('/reminders/settings')}
        style={[styles.iconButton, { backgroundColor: theme[status.background] }]}>
        <Icon name={status.icon} size={22} color={theme[status.color]} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="إضافة تذكير"
        onPress={() => router.push('/reminders/new')}
        style={[styles.iconButton, { backgroundColor: theme.primary }]}>
        <Icon name="add" size={24} color={theme.onPrimary} />
      </Pressable>
    </View>
  );
}

/** Shown while there are active reminders the phone isn't allowed to announce. */
function PermissionBanner() {
  const { permission } = useReminders();
  const enable = useEnableNotifications();
  if (permission.status === 'granted' || permission.status === 'unsupported') return null;

  return (
    <Notice icon="notifications_off" tone="warning" text="تذكيراتك محفوظة، لكن لن يصلك إشعار حتى تسمح بالتنبيهات.">
      <Button
        label={enable.canAsk ? 'السماح بالتنبيهات' : 'فتح إعدادات الإشعارات'}
        icon={enable.canAsk ? 'notifications_active' : 'settings'}
        variant="tonal"
        compact
        onPress={enable.start}
      />
      {enable.prompt}
    </Notice>
  );
}

function Notice({
  icon,
  tone,
  text,
  children,
}: {
  icon: IconName;
  tone: 'info' | 'warning';
  text: string;
  children?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.notice, { backgroundColor: theme[`${tone}Soft`] }]}>
      <Icon name={icon} color={theme[tone]} />
      <View style={styles.noticeBody}>
        <ThemedText type="small" themeColor={tone}>
          {text}
        </ThemedText>
        {children}
      </View>
    </View>
  );
}

function EmptyState() {
  const theme = useTheme();

  return (
    <View style={styles.empty}>
      <View style={[styles.emptyRing, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
          <Icon name="notifications" size={36} color={theme.primary} />
        </View>
      </View>
      <ThemedText type="title">لا توجد تذكيرات بعد</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        أضف أول تذكير، وسنذكّرك به في موعده حتى بدون إنترنت.
      </ThemedText>
      <Button label="إضافة تذكير" icon="add" onPress={() => router.push('/reminders/new')} style={styles.emptyButton} />
    </View>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.two + Spacing.half,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.lg,
  },
  noticeBody: {
    flex: 1,
    gap: Spacing.two,
  },
  loading: {
    marginTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
  filterEmpty: {
    marginTop: Spacing.five,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  emptyRing: {
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
});
