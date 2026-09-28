import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Brand screen shown over the app right after launch; the root layout removes it after a moment.
 * Android's own launch screen is left blank in the same color (app.json), so this is the only one seen.
 */
export function SplashOverlay() {
  const theme = useTheme();

  return (
    <Animated.View
      exiting={FadeOut.duration(400)}
      style={[StyleSheet.absoluteFill, { backgroundColor: theme.brandGradient[0] }]}>
      <Animated.View entering={FadeIn.duration(300)} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={theme.brandGradient} style={styles.container}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
            <ThemedText style={[styles.name, { color: theme.onPrimary }]}>هِمّة</ThemedText>
            <View style={styles.rule} />
            <ThemedText style={[styles.slogan, { color: theme.onPrimary }]}>كل تكليف يصنع أثرًا</ThemedText>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
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
