import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { Card } from "@/components/card";
import { Icon, type IconName } from "@/components/icon";
import { Sheet } from "@/components/sheet";
import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { DeleteReminderDialog } from "@/features/reminders/delete-reminder-dialog";
import {
  describeSchedule,
  displayStatus,
  nextOccurrence,
} from "@/features/reminders/recurrence";
import {
  alertProblem,
  formatAlertDay,
  ReminderStatusChip,
} from "@/features/reminders/reminder-status";
import { useReminders } from "@/features/reminders/reminders-store";
import type { Reminder } from "@/features/reminders/types";
import { useToggleReminder } from "@/features/reminders/use-toggle-reminder";
import { useTheme } from "@/hooks/use-theme";
import { formatTime } from "@/utils/date";

export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const theme = useTheme();
  const { permission } = useReminders();
  const toggle = useToggleReminder();
  const [open, setOpen] = useState<"menu" | "delete" | null>(null);
  const status = displayStatus(reminder);
  const next = nextOccurrence(reminder);
  const problem = alertProblem(reminder, permission);
  const detailsHref = `/reminders/${reminder.id}` as const;

  return (
    <>
      {/* Swipe one way to stop or resume the reminder, the other way to delete it. */}
      <ReanimatedSwipeable
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableWillOpen={() =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        }
        renderLeftActions={
          status === "ended"
            ? undefined
            : (_progress, _translation, swipeable) => (
                <SwipeAction
                  icon={
                    reminder.isEnabled
                      ? "notifications_paused"
                      : "notifications_active"
                  }
                  label={reminder.isEnabled ? "إيقاف" : "تفعيل"}
                  onPress={() => {
                    swipeable.close();
                    toggle(reminder.id, !reminder.isEnabled);
                  }}
                />
              )
        }
        renderRightActions={(_progress, _translation, swipeable) => (
          <SwipeAction
            icon="delete"
            label="حذف"
            danger
            onPress={() => {
              swipeable.close();
              setOpen("delete");
            }}
          />
        )}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityHint="يعرض تفاصيل التذكير"
          onPress={() => router.push(detailsHref)}
        >
          <Card>
            <View style={styles.header}>
              <View style={[styles.text, status !== "active" && styles.dimmed]}>
                <ThemedText type="heading">{reminder.title}</ThemedText>
                {reminder.message !== "" && (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    numberOfLines={2}
                  >
                    {reminder.message}
                  </ThemedText>
                )}
              </View>
              {status !== "ended" && (
                <Switch
                  accessibilityLabel={
                    reminder.isEnabled
                      ? `إيقاف تذكير ${reminder.title}`
                      : `تفعيل تذكير ${reminder.title}`
                  }
                  value={reminder.isEnabled}
                  onValueChange={(enabled) => toggle(reminder.id, enabled)}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor={theme.surface}
                />
              )}
            </View>

            <View style={[styles.meta, status !== "active" && styles.dimmed]}>
              {next && status !== "ended" ? (
                <View style={styles.row}>
                  <Meta icon="calendar_today" text={formatAlertDay(next)} />
                  <Meta icon="schedule" text={formatTime(next)} />
                </View>
              ) : (
                <Meta icon="event_busy" text="لا توجد مواعيد قادمة" />
              )}
              <Meta icon="repeat" text={describeSchedule(reminder)} />
            </View>

            {problem && (
              <View
                style={[styles.problem, { backgroundColor: theme.warningSoft }]}
              >
                <Icon name="warning" size={16} color={theme.warning} />
                <ThemedText
                  type="caption"
                  themeColor="warning"
                  style={styles.shrink}
                >
                  {problem}
                </ThemedText>
              </View>
            )}

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <ReminderStatusChip reminder={reminder} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`خيارات تذكير ${reminder.title}`}
                onPress={() => setOpen("menu")}
                style={[
                  styles.menuButton,
                  { backgroundColor: theme.surfaceMuted },
                ]}
              >
                <Icon name="more_vert" size={20} color={theme.text} />
              </Pressable>
            </View>
          </Card>
        </Pressable>
      </ReanimatedSwipeable>

      <Sheet
        visible={open === "menu"}
        onClose={() => setOpen(null)}
        title={reminder.title}
      >
        <View>
          <MenuItem
            icon="visibility"
            label="عرض التفاصيل"
            onPress={() => {
              setOpen(null);
              router.push(detailsHref);
            }}
          />
          <MenuItem
            icon="edit"
            label="تعديل"
            onPress={() => {
              setOpen(null);
              router.push(`/reminders/${reminder.id}/edit`);
            }}
          />
          <MenuItem
            icon="delete"
            label="حذف"
            danger
            onPress={() => setOpen("delete")}
          />
        </View>
      </Sheet>

      <DeleteReminderDialog
        reminderId={reminder.id}
        visible={open === "delete"}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={16} color={theme.primary} />
      <ThemedText type="small" style={styles.shrink}>
        {text}
      </ThemedText>
    </View>
  );
}

function SwipeAction({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: IconName;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.swipeAction,
        { backgroundColor: danger ? theme.dangerSoft : theme.primarySoft },
      ]}
    >
      <Icon name={icon} size={22} color={color} />
      <ThemedText type="label" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: IconName;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.menuItem}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: danger ? theme.dangerSoft : theme.surfaceMuted },
        ]}
      >
        <Icon name={icon} size={20} color={color} />
      </View>
      <ThemedText type="label" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three - Spacing.one,
  },
  text: {
    flex: 1,
    gap: Spacing.one,
  },
  dimmed: {
    opacity: 0.6,
  },
  meta: {
    gap: Spacing.one + Spacing.half,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: Spacing.three,
    rowGap: Spacing.one,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + Spacing.half,
  },
  shrink: {
    flexShrink: 1,
  },
  problem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.three - Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeAction: {
    width: 88,
    marginHorizontal: Spacing.two,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - Spacing.one,
    minHeight: 56,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
