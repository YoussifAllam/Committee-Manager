import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { openBatterySettings, openExactAlarmSettings, openNotificationSettings } from '@/features/reminders/device-settings';
import { useEnableNotifications } from '@/features/reminders/permission-prompt';
import { useReminders } from '@/features/reminders/reminders-store';
import { useTheme } from '@/hooks/use-theme';

const HELP = [
  'تأكد من السماح بالإشعارات.',
  'اسمح للتطبيق بالعمل في الخلفية.',
  'ألغِ تقييد البطارية للتطبيق عند الحاجة.',
  'فعّل التشغيل التلقائي على الأجهزة التي توفر هذا الخيار.',
];

/** إعدادات فكّرني: notification permission, exact alarms, troubleshooting and privacy. */
export default function ReminderSettingsScreen() {
  const theme = useTheme();
  const { permission } = useReminders();
  const enable = useEnableNotifications();
  const isAndroid = Platform.OS === 'android';

  const status: { icon: IconName; color: ThemeColor; background: ThemeColor; title: string; text: string } =
    permission.status === 'granted'
      ? {
          icon: 'notifications_active',
          color: 'success',
          background: 'successSoft',
          title: 'الإشعارات مفعّلة',
          text: 'ستصلك تذكيراتك في مواعيدها، حتى والتطبيق مغلق.',
        }
      : permission.status === 'unsupported'
        ? {
            icon: 'notifications_paused',
            color: 'textSecondary',
            background: 'surfaceMuted',
            title: 'التنبيهات غير متاحة هنا',
            text: 'التنبيهات المجدولة تعمل في تطبيق الهاتف فقط.',
          }
        : {
            icon: 'notifications_off',
            color: 'warning',
            background: 'warningSoft',
            title: 'الإشعارات غير مفعّلة',
            text: 'اسمح بالإشعارات حتى يصلك التذكير.',
          };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Section title="التنبيهات">
        <View style={styles.statusRow}>
          <View style={[styles.statusIcon, { backgroundColor: theme[status.background] }]}>
            <Icon name={status.icon} size={22} color={theme[status.color]} />
          </View>
          <View style={styles.grow}>
            <ThemedText type="label">{status.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {status.text}
            </ThemedText>
          </View>
        </View>
        {permission.status === 'granted' && (
          <Button label="فتح إعدادات الإشعارات" icon="settings" variant="tonal" onPress={openNotificationSettings} />
        )}
        {(permission.status === 'denied' || permission.status === 'undetermined') && (
          <Button
            label={enable.canAsk ? 'السماح بالتنبيهات' : 'فتح إعدادات الإشعارات'}
            icon={enable.canAsk ? 'notifications_active' : 'settings'}
            onPress={enable.start}
          />
        )}
      </Section>

      {isAndroid && (
        <Section title="التنبيه في الوقت المحدد بدقة">
          <ThemedText type="small" themeColor="textSecondary">
            يصل التنبيه عادةً في موعده أو بعده بدقائق قليلة توفيرًا للبطارية. ليصل على الدقيقة نفسها، اسمح لهِمّة
            بضبط المنبهات والتذكيرات.
          </ThemedText>
          <Button label="فتح إعدادات المنبهات والتذكيرات" icon="alarm_on" variant="tonal" onPress={openExactAlarmSettings} />
        </Section>
      )}

      <Section title="لا تصلك التنبيهات؟">
        <View style={styles.list}>
          {HELP.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Icon name="check_circle" size={18} color={theme.primary} />
              <ThemedText style={styles.grow}>{tip}</ThemedText>
            </View>
          ))}
        </View>
        {isAndroid && (
          <View style={styles.buttons}>
            <Button label="إعدادات الإشعارات" icon="notifications" variant="tonal" compact onPress={openNotificationSettings} />
            <Button label="إعدادات البطارية" icon="battery_saver" variant="tonal" compact onPress={openBatterySettings} />
          </View>
        )}
      </Section>

      <Section title="خصوصية تذكيراتك" icon="lock">
        <ThemedText>تُحفظ تذكيراتك على هذا الهاتف فقط، ولا يتم إرسالها إلى أي خادم.</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          عند حذف التطبيق أو مسح بياناته، سيتم حذف التذكيرات.
        </ThemedText>
      </Section>

      {enable.prompt}
    </ScrollView>
  );
}

function Section({ title, icon, children }: { title: string; icon?: IconName; children: ReactNode }) {
  const theme = useTheme();

  return (
    <Card>
      <View style={styles.sectionTitle}>
        {icon && <Icon name={icon} color={theme.primary} />}
        <ThemedText type="heading">{title}</ThemedText>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
