import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { currentUser } from '@/mocks/data';

export default function ProfileScreen() {
  return (
    <Screen>
      <ThemedText type="title">{currentUser.name}</ThemedText>
      <ThemedText themeColor="textSecondary">سيظهر هنا ملفك الشخصي وإعدادات حسابك.</ThemedText>
    </Screen>
  );
}
