import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSelectedCommittee } from '@/features/committees/selected-committee';
import { useTheme } from '@/hooks/use-theme';

/** Trigger that opens a bottom sheet to switch the app-wide selected committee. */
export function CommitteePicker({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const { committees, committee: selected, select: onSelect } = useSelectedCommittee();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const outlined = { backgroundColor: theme.surface, borderColor: theme.border };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`اللجنة الحالية: ${selected.name}. اضغط للتبديل بين لجانك`}
        onPress={() => setOpen(true)}
        style={[styles.trigger, outlined, style]}>
        <Icon name="groups" size={18} color={theme.primary} />
        <ThemedText type="label" numberOfLines={1} style={styles.grow}>
          {selected.name}
        </ThemedText>
        {committees.length > 1 && <Icon name="expand_more" size={18} />}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="إغلاق"
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.three },
          ]}>
          <View style={styles.handle} />
          <ThemedText type="heading" style={styles.sheetTitle}>
            لجانك
          </ThemedText>

          <FlatList
            data={committees}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            renderItem={({ item }) => {
              const isSelected = item.id === selected.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  style={styles.row}>
                  <View style={[styles.rowIcon, { backgroundColor: theme.primarySoft }]}>
                    <Icon name="groups" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.rowText}>
                    <ThemedText type="label">{item.name}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {item.role}
                    </ThemedText>
                  </View>
                  {isSelected && <Icon name="check_circle" color={theme.primary} />}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 40,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  grow: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 26, 46, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: '#D8DEE9',
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    marginBottom: Spacing.two,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
