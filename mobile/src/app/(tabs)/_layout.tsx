import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    // The app bar sits above the tabs, so it stays fixed while each tab scrolls under it.
    <View style={styles.container}>
      <AppBar />
      <NativeTabs
        backgroundColor={theme.surface}
        indicatorColor={theme.primarySoft}
        labelVisibilityMode="labeled"
        iconColor={{ default: theme.textSecondary, selected: theme.primary }}
        labelStyle={{
          default: { fontFamily: Fonts.medium, color: theme.textSecondary },
          selected: { fontFamily: Fonts.bold, color: theme.primary },
        }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>الرئيسية</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house" md="home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="meetings">
          <NativeTabs.Trigger.Label>الاجتماعات</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="calendar" md="event" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="assignments">
          <NativeTabs.Trigger.Label>التكليفات</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="checklist" md="task_alt" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="reminders">
          <NativeTabs.Trigger.Label>فكّرني</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="bell.badge" md="notification_add" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="more">
          <NativeTabs.Trigger.Label>المزيد</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="ellipsis" md="more_horiz" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
