import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Radius, Spacing } from '@/constants/theme';
import { openNotificationSettings } from '@/features/reminders/device-settings';
import { useReminders } from '@/features/reminders/reminders-store';
import { useTheme } from '@/hooks/use-theme';

type PromptProps = {
  visible: boolean;
  /** Continue to the OS dialog or settings screen. */
  onAllow: () => void;
  onLater: () => void;
};

/**
 * Explains why notifications are needed, right before the OS permission dialog appears.
 * With `settings`, the OS won't ask again, so the button opens the phone's notification settings instead.
 */
export function PermissionPrompt({ settings, ...props }: PromptProps & { settings?: boolean }) {
  return (
    <PromptSheet
      {...props}
      icon="notifications_active"
      title="فعّل التنبيهات"
      description="يحتاج هِمّة إلى إذن الإشعارات حتى يذكّرك في الموعد الذي تحدده، حتى عندما يكون التطبيق مغلقًا."
      allowLabel={settings ? 'فتح إعدادات الإشعارات' : 'السماح بالتنبيهات'}
    />
  );
}

/** Android has no dialog for exact alarms, so this explains the setting before opening it. */
export function ExactAlarmPrompt(props: PromptProps) {
  return (
    <PromptSheet
      {...props}
      icon="alarm_on"
      title="اسمح بضبط المنبهات والتذكيرات"
      description="حتى يصلك كل تذكير في دقيقته بالضبط، فعّل «السماح بضبط المنبهات والتذكيرات» لهِمّة في الصفحة التالية."
      allowLabel="فتح الإعدادات"
    />
  );
}

function PromptSheet({
  visible,
  onAllow,
  onLater,
  icon,
  title,
  description,
  allowLabel,
}: PromptProps & { icon: IconName; title: string; description: string; allowLabel: string }) {
  const theme = useTheme();

  return (
    <Sheet visible={visible} onClose={onLater}>
      <View style={styles.body}>
        <View style={[styles.illustration, { backgroundColor: theme.primarySoft }]}>
          <Icon name={icon} size={36} color={theme.primary} />
        </View>
        <ThemedText type="title" style={styles.center}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {description}
        </ThemedText>
      </View>
      <Button label={allowLabel} icon={icon} onPress={onAllow} />
      <Button label="ليس الآن" variant="plain" onPress={onLater} />
    </Sheet>
  );
}

/**
 * "السماح بالتنبيهات" outside the form: explains first, then shows the OS dialog. Once the OS no longer
 * allows asking, `start` opens the phone's notification settings instead. Render `prompt` once.
 */
export function useEnableNotifications() {
  const store = useReminders();
  const showToast = useToast();
  const [explaining, setExplaining] = useState(false);
  const canAsk = store.permission.canAskAgain;

  const start = () => (canAsk ? setExplaining(true) : openNotificationSettings());

  const prompt = (
    <PermissionPrompt
      visible={explaining}
      onAllow={async () => {
        setExplaining(false);
        const result = await store.requestPermission().catch(() => null);
        showToast(
          result?.status === 'granted'
            ? { tone: 'success', message: 'تم تفعيل التنبيهات. ستصلك تذكيراتك في مواعيدها.' }
            : {
                tone: 'warning',
                message: 'اسمح بالإشعارات حتى يصلك التذكير.',
                action: { label: 'فتح إعدادات الإشعارات', onPress: openNotificationSettings },
              },
        );
      }}
      onLater={() => {
        setExplaining(false);
        store.dismissPermissionPrompt();
      }}
    />
  );

  return { canAsk, start, prompt };
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  illustration: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
});
