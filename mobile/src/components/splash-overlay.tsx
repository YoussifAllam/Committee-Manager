import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Brand screen shown over the app right after launch. The native splash screen can only show
 * an image, so the name and slogan live here as real text; the root layout removes it after a moment.
 */
export function SplashOverlay() {
  const theme = useTheme();

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <LinearGradient colors={theme.brandGradient} style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
          <ThemedText style={[styles.name, { color: theme.onPrimary }]}>هِمّة</ThemedText>
          <View style={styles.rule} />
          <ThemedText style={[styles.slogan, { color: theme.onPrimary }]}>كل تكليف يصنع أثرًا</ThemedText>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  // Tall line height: the shadda and kasra on "هِمّة" sit above and below the letters.
  name: {
    fontFamily: Fonts.bold,
    fontSize: 56,
    lineHeight: 88,
  },
  rule: {
    width: 40,
    height: 2,
    marginVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  slogan: {
    fontFamily: Fonts.medium,
    fontSize: 18,
    lineHeight: 30,
    opacity: 0.85,
  },
});
