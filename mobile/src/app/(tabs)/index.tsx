import { Link } from 'expo-router';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function MeetingsScreen() {
  return (
    <Screen>
      <ThemedText type="subtitle">Meetings</ThemedText>
      <Link href="/meetings/new">
        <ThemedText type="linkPrimary">New meeting</ThemedText>
      </Link>
      <Link href="/meetings/1">
        <ThemedText type="linkPrimary">Open sample meeting</ThemedText>
      </Link>
    </Screen>
  );
}
