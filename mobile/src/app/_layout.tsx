import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meetings/[id]" options={{ title: 'Meeting' }} />
        <Stack.Screen name="meetings/new" options={{ title: 'New meeting', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
