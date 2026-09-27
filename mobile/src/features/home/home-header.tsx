import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { greeting } from '@/utils/date';

// The header is ink in both themes, so its foreground colors don't change with the theme.
const ON_INK = '#FFFFFF';
const ON_INK_MUTED = 'rgba(255, 255, 255, 0.72)';
const GLASS = 'rgba(255, 255, 255, 0.12)';
const BRASS = '#D9AE5F';
const ALERT = '#E5484D';

type HomeHeaderProps = {
  userName: string;
  role: string;
  committeeName: string;
  unreadNotifications: number;
};

export function HomeHeader({ userName, role, committeeName, unreadNotifications }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [inkLight, inkDeep] = theme.headerGradient;

  return (
    <LinearGradient
      colors={theme.headerGradient}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="groups" color={ON_INK} />
          </View>
          <ThemedText type="label" style={styles.onInk} numberOfLines={1}>
            {committeeName}
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`الإشعارات، ${unreadNotifications} غير مقروءة`}
          style={styles.iconButton}>
          <Icon name="notifications" size={22} color={ON_INK} />
          {unreadNotifications > 0 && (
            <View style={[styles.badge, { borderColor: inkLight }]}>
              <ThemedText style={styles.badgeText}>{unreadNotifications}</ThemedText>
            </View>
          )}
        </Pressable>

        <Link href="/more" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="حسابي" style={styles.avatar}>
            <ThemedText style={[styles.avatarText, { color: inkDeep }]}>{userName[0]}</ThemedText>
          </Pressable>
        </Link>
      </View>

      <View style={styles.greeting}>
        <ThemedText type="small" style={{ color: ON_INK_MUTED }}>
          {greeting()}،
        </ThemedText>
        <ThemedText type="display" style={styles.onInk}>
          {userName}
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`صفة العضوية: ${role}. تغيير الصفة`}
        style={styles.roleChip}>
        <Icon name="shield_person" size={16} color={ON_INK} />
        <ThemedText type="small" style={styles.onInk}>
          {role}
        </ThemedText>
        <Icon name="expand_more" size={18} color={ON_INK_MUTED} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  onInk: {
    color: ON_INK,
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
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS,
  },
  badge: {
    position: 'absolute',
    top: 4,
    end: 4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ALERT,
  },
  badgeText: {
    color: ON_INK,
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
    backgroundColor: BRASS,
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
    height: 32,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: GLASS,
  },
});
