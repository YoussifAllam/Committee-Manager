import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** A centered question with two answers, drawn in the app's own style (unlike Alert, which web ignores). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'إلغاء',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel={cancelLabel} style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View accessibilityRole="alert" style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <ThemedText type="title">{title}</ThemedText>
          <ThemedText themeColor="textSecondary">{message}</ThemedText>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="tonal" onPress={onCancel} style={styles.grow} />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.grow}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // A modal is its own root, outside the app's RTL view, so it sets the direction again.
  backdrop: {
    flex: 1,
    direction: 'rtl',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(20, 26, 46, 0.4)',
  },
  dialog: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  grow: {
    flex: 1,
  },
});
