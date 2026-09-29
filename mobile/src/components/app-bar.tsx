import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { CommitteePicker } from '@/features/committees/committee-picker';
import { useTheme } from '@/hooks/use-theme';
import { currentUser, unreadNotifications } from '@/mocks/data';

// Tabs whose content follows the selected committee; the others (meetings, فكّرني, المزيد) don't show it.
const COMMITTEE_TABS = ['/', '/assignments'];

/** Fixed bar above every tab: app name, the committee picker where it applies, notifications and the profile. */
export function AppBar() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + Spacing.two, backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}>
      <ThemedText style={[styles.brand, { color: theme.primary }]}>هِمّة</ThemedText>
      <View style={styles.middle}>{COMMITTEE_TABS.includes(pathname) && <CommitteePicker />}</View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`الإشعارات، ${unreadNotifications} غير مقروءة`}
        onPress={() => router.push('/notifications')}
        style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
        <Icon name="notifications" size={22} color={theme.text} />
        {unreadNotifications > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.surface }]}>
            <ThemedText style={[styles.badgeText, { color: theme.onPrimary }]}>{unreadNotifications}</ThemedText>
          </View>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="الملف الشخصي"
        onPress={() => router.push('/profile')}
        style={[styles.iconButton, { backgroundColor: theme.primary }]}>
        <ThemedText style={[styles.avatarText, { color: theme.onPrimary }]}>{currentUser.name[0]}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // Tall line height: the shadda and kasra on "هِمّة" sit above and below the letters.
  brand: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 40,
  },
  middle: {
    flex: 1,
    alignItems: 'flex-start',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    end: 0,
    minWidth: 20,
    height: 20,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    lineHeight: 14,
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 28,
  },
});
