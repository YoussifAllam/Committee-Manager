import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-store';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.who}>
        <ThemedText type="title">{user?.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
      </View>
      <ThemedText themeColor="textSecondary">سيظهر هنا ملفك الشخصي وإعدادات حسابك.</ThemedText>
      <Button label="تسجيل الخروج" icon="logout" variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  who: {
    gap: Spacing.half,
  },
});
