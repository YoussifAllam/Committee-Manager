import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { greeting } from '@/utils/date';

type HomeHeaderProps = {
  userName: string;
  role: string;
  committeeName: string;
  unreadNotifications: number;
};

export function HomeHeader({ userName, role, committeeName, unreadNotifications }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const outlined = { backgroundColor: theme.surface, borderColor: theme.border };

  return (
    <LinearGradient
      colors={theme.headerGradient}
      style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={[styles.logo, outlined]}>
            <Icon name="groups" color={theme.primary} />
          </View>
          <ThemedText type="label" numberOfLines={1}>
            {committeeName}
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`الإشعارات، ${unreadNotifications} غير مقروءة`}
          style={[styles.iconButton, outlined]}>
          <Icon name="notifications" size={22} color={theme.text} />
          {unreadNotifications > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.surface }]}>
              <ThemedText style={[styles.badgeText, { color: theme.onPrimary }]}>{unreadNotifications}</ThemedText>
            </View>
          )}
        </Pressable>

        {/* One merged style object: on web, `Link asChild` hands the child's style to an <a> tag, which rejects arrays. */}
        <Link href="/more" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="حسابي"
            style={{ ...styles.avatar, backgroundColor: theme.primary }}>
            <ThemedText style={[styles.avatarText, { color: theme.onPrimary }]}>{userName[0]}</ThemedText>
          </Pressable>
        </Link>
      </View>

      <View style={styles.greeting}>
        <ThemedText type="small" themeColor="textSecondary">
          {greeting()}،
        </ThemedText>
        <ThemedText type="display">{userName}</ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`صفة العضوية: ${role}. تغيير الصفة`}
        style={[styles.roleChip, outlined]}>
        <Icon name="shield_person" size={16} color={theme.primary} />
        <ThemedText type="small">{role}</ThemedText>
        <Icon name="expand_more" size={18} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    end: 2,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 28,
  },
  greeting: {
    marginTop: Spacing.four,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    height: 34,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
