import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, useFonts } from '@expo-google-fonts/tajawal';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { SelectedCommitteeProvider } from '@/features/committees/selected-committee';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
    // Each weight is its own font file, so fontWeight stays normal to avoid faux bold on Android.
    fonts: {
      regular: { fontFamily: Fonts.regular, fontWeight: 'normal' },
      medium: { fontFamily: Fonts.medium, fontWeight: 'normal' },
      bold: { fontFamily: Fonts.bold, fontWeight: 'normal' },
      heavy: { fontFamily: Fonts.bold, fontWeight: 'normal' },
    },
  } as const;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="dark" />
      {/* The app is Arabic-only. Builds force RTL natively (expo-localization plugin in app.json);
          this also mirrors layout in Expo Go, which ignores that plugin. */}
      <SelectedCommitteeProvider>
        <View style={styles.rtl}>
          <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="meetings/[id]" options={{ title: 'الاجتماع' }} />
            <Stack.Screen name="meetings/new" options={{ title: 'اجتماع جديد', presentation: 'modal' }} />
            <Stack.Screen name="assignments/[id]" options={{ title: 'التكليف' }} />
          </Stack>
        </View>
      </SelectedCommitteeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  rtl: {
    flex: 1,
    direction: 'rtl',
  },
});
