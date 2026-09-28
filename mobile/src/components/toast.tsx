import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ToastTone = 'success' | 'warning' | 'danger' | 'info';

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  action?: { label: string; onPress: () => void };
};

const ICONS: Record<ToastTone, IconName> = {
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
  info: 'info',
};

// Clears the tab bar on tab screens; on other screens it simply floats a little higher.
const BOTTOM_OFFSET = 96;

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});

/** Short confirmation at the bottom of the screen; it stays through navigation, so a form can close first. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const counter = useRef(0);
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  useEffect(() => {
    if (!toast) return;
    // Longer when there's a button to reach.
    const timer = setTimeout(() => setToast(null), toast.action ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const show = (options: ToastOptions) => {
    counter.current += 1;
    setToast({ ...options, id: counter.current });
  };

  const tone = toast?.tone ?? 'success';

  return (
    <ToastContext value={show}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown}
          exiting={FadeOut}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            { bottom: insets.bottom + BOTTOM_OFFSET, backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <View style={[styles.icon, { backgroundColor: theme[`${tone}Soft`] }]}>
            <Icon name={ICONS[tone]} size={18} color={theme[tone]} />
          </View>
          <ThemedText type="small" style={styles.message}>
            {toast.message}
          </ThemedText>
          {toast.action && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                toast.action?.onPress();
                setToast(null);
              }}
              style={styles.action}>
              <ThemedText type="label" themeColor="primary">
                {toast.action.label}
              </ThemedText>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    start: Spacing.three,
    end: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.lg,
    borderWidth: 1,
    boxShadow: '0 6px 20px rgba(8, 48, 44, 0.16)',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});
