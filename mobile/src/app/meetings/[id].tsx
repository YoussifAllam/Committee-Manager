import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <ThemedText themeColor="textSecondary">Meeting {id}</ThemedText>
    </Screen>
  );
}
