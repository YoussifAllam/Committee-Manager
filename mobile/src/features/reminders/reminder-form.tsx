import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useReminders } from '@/features/reminders/reminders-store';
import { scheduleSummary } from '@/features/reminders/schedule';
import type { Reminder, Repeat } from '@/features/reminders/types';
import { useTheme } from '@/hooks/use-theme';
import { addDays, formatLongDate, formatTime, startOfDay, WEEKDAYS } from '@/utils/date';

type RepeatMode = 'weekly' | '14' | '30' | 'custom';

const MODES: { value: RepeatMode; label: string }[] = [
  { value: 'weekly', label: 'أسبوعيًا' },
  { value: '14', label: 'كل 14 يومًا' },
  { value: '30', label: 'كل 30 يومًا' },
  { value: 'custom', label: 'عدد أيام مخصص' },
];

// Short chip labels: "الاثنين" → "اثنين".
const WEEKDAY_CHIPS = WEEKDAYS.map((name) => name.replace(/^ال/, ''));

function initialMode(repeat?: Repeat): RepeatMode {
  if (repeat?.kind !== 'interval') return 'weekly';
  return repeat.days === 14 || repeat.days === 30 ? (String(repeat.days) as RepeatMode) : 'custom';
}

/** A new reminder starts tomorrow at 9:00 صباحًا. */
function defaultStart() {
  const tomorrow = addDays(startOfDay(new Date()), 1);
  tomorrow.setHours(9);
  return tomorrow;
}

function openPicker(mode: 'date' | 'time', value: Date, onPick: (picked: Date) => void) {
  DateTimePickerAndroid.open({
    value,
    mode,
    onChange: (event, picked) => {
      if (event.type === 'set' && picked) onPick(picked);
    },
  });
}

/** Create/edit form shared by /reminders/new and /reminders/[id]. */
export function ReminderForm({ reminder }: { reminder?: Reminder }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { save } = useReminders();

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [message, setMessage] = useState(reminder?.message ?? '');
  const [startsAt, setStartsAt] = useState(reminder?.startsAt ?? defaultStart);
  const [repeats, setRepeats] = useState(reminder ? reminder.repeat.kind !== 'none' : false);
  const [mode, setMode] = useState(initialMode(reminder?.repeat));
  const [weekdays, setWeekdays] = useState(
    reminder?.repeat.kind === 'weekly' ? reminder.repeat.weekdays : [startsAt.getDay()],
  );
  const [customDays, setCustomDays] = useState(reminder?.repeat.kind === 'interval' ? String(reminder.repeat.days) : '7');
  const [endsOn, setEndsOn] = useState(reminder?.endsOn);
  // Errors only show after the first save attempt, not while the user is still typing.
  const [submitted, setSubmitted] = useState(false);

  function toRepeat(): Repeat {
    if (!repeats) return { kind: 'none' };
    if (mode === 'weekly') return { kind: 'weekly', weekdays };
    return { kind: 'interval', days: Number(mode === 'custom' ? customDays : mode) };
  }
  const repeat = toRepeat();

  const errors = {
    title: title.trim() ? '' : 'اكتب عنوانًا للتذكير.',
    startsAt: repeat.kind === 'none' && startsAt <= new Date() ? 'اختر موعدًا لم يمر بعد.' : '',
    weekdays: repeat.kind === 'weekly' && weekdays.length === 0 ? 'اختر يومًا واحدًا على الأقل.' : '',
    customDays:
      repeat.kind === 'interval' && !(Number.isInteger(repeat.days) && repeat.days >= 1) ? 'اكتب عدد أيام صحيحًا.' : '',
    endsOn: repeats && endsOn && endsOn < startOfDay(startsAt) ? 'تاريخ النهاية قبل تاريخ البدء.' : '',
  };
  const shown = (field: keyof typeof errors) => (submitted ? errors[field] : '');
  const repeatIncomplete = Boolean(errors.weekdays || errors.customDays);

  const onSave = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    save({
      id: reminder?.id,
      title: title.trim(),
      message: message.trim(),
      startsAt,
      repeat,
      endsOn: repeats ? endsOn : undefined,
      enabled: reminder?.enabled ?? true,
    });
    router.back();
  };

  // Changing the date keeps the chosen time, and vice versa.
  const setDate = (day: Date) =>
    setStartsAt(new Date(day.getFullYear(), day.getMonth(), day.getDate(), startsAt.getHours(), startsAt.getMinutes()));
  const setTime = (time: Date) =>
    setStartsAt(new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate(), time.getHours(), time.getMinutes()));
  const toggleWeekday = (day: number) =>
    setWeekdays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));

  const inputStyle = [styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.privacy}>
          <Icon name="lock" size={16} />
          <ThemedText type="caption" themeColor="textSecondary">
            خاص بحسابك فقط، ولا يراه أحد غيرك.
          </ThemedText>
        </View>

        <Field label="عنوان التذكير" required error={shown('title')}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="مثال: متابعة موافقة إدارة المسجد"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="نص رسالة التنبيه">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="التفاصيل التي ستظهر لك عند التنبيه"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <View style={styles.pair}>
          <Field label="تاريخ البدء" required error={shown('startsAt')} style={styles.grow}>
            <PickerButton icon="calendar_today" text={formatLongDate(startsAt)} onPress={() => openPicker('date', startsAt, setDate)} />
          </Field>
          <Field label="وقت التنبيه" required style={styles.grow}>
            <PickerButton icon="schedule" text={formatTime(startsAt)} onPress={() => openPicker('time', startsAt, setTime)} />
          </Field>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.switchRow}>
            <View style={styles.grow}>
              <ThemedText type="label">تكرار التنبيه</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                يتكرر التذكير تلقائيًا حسب النمط الذي تختاره.
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="تكرار التنبيه"
              value={repeats}
              onValueChange={setRepeats}
              trackColor={{ true: theme.primary, false: theme.border }}
              thumbColor={theme.surface}
            />
          </View>

          {repeats && (
            <>
              <Field label="نمط التكرار">
                <View style={styles.chips}>
                  {MODES.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={mode === option.value}
                      onPress={() => setMode(option.value)}
                    />
                  ))}
                </View>
              </Field>

              {mode === 'weekly' && (
                <Field label="أيام الأسبوع" error={shown('weekdays')}>
                  <View style={styles.chips}>
                    {WEEKDAY_CHIPS.map((label, day) => (
                      <ChoiceChip
                        key={label}
                        label={label}
                        selected={weekdays.includes(day)}
                        onPress={() => toggleWeekday(day)}
                      />
                    ))}
                  </View>
                </Field>
              )}

              {mode === 'custom' && (
                <Field label="عدد الأيام بين كل تنبيه والذي يليه" error={shown('customDays')}>
                  <TextInput
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={[inputStyle, styles.daysInput]}
                  />
                </Field>
              )}

              <Field label="تاريخ نهاية التكرار (اختياري)" error={shown('endsOn')}>
                <PickerButton
                  icon="event"
                  text={endsOn ? formatLongDate(endsOn) : 'بدون تاريخ نهاية'}
                  muted={!endsOn}
                  onPress={() => openPicker('date', endsOn ?? startsAt, setEndsOn)}
                  onClear={endsOn && (() => setEndsOn(undefined))}
                />
              </Field>
            </>
          )}
        </View>

        <View style={[styles.summary, { backgroundColor: theme.primarySoft }]}>
          <Icon name="auto_awesome" color={theme.primary} />
          <View style={styles.grow}>
            <ThemedText type="label" themeColor="primary">
              ملخص جدول التذكير
            </ThemedText>
            <ThemedText type="small" themeColor="primary">
              {repeatIncomplete ? 'أكمل إعدادات التكرار لعرض الملخص.' : scheduleSummary({ startsAt, repeat, endsOn })}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button label="حفظ التذكير" icon="check" onPress={onSave} style={styles.grow} />
        <Button label="إلغاء" variant="tonal" onPress={() => router.back()} />
      </View>
    </View>
  );
}

function Field({
  label,
  required,
  error,
  style,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View style={[styles.field, style]}>
      <ThemedText type="label">
        {label}
        {required && <ThemedText type="label" themeColor="danger"> *</ThemedText>}
      </ThemedText>
      {children}
      {!!error && (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

function PickerButton({
  icon,
  text,
  muted,
  onPress,
  onClear,
}: {
  icon: IconName;
  text: string;
  muted?: boolean;
  onPress: () => void;
  onClear?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.input, styles.pickerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Icon name={icon} size={18} color={theme.primary} />
      <ThemedText themeColor={muted ? 'textSecondary' : 'text'} numberOfLines={1} style={styles.grow}>
        {text}
      </ThemedText>
      {onClear && (
        <Pressable accessibilityRole="button" accessibilityLabel="إزالة التاريخ" hitSlop={Spacing.two} onPress={onClear}>
          <Icon name="close" size={18} />
        </Pressable>
      )}
    </Pressable>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <ThemedText type="small" style={{ color: selected ? theme.onPrimary : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three + Spacing.one,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  field: {
    gap: Spacing.one + Spacing.half,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.md,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  multiline: {
    minHeight: 96,
    paddingTop: Spacing.three - Spacing.one,
    textAlignVertical: 'top',
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
  },
  grow: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  section: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  choice: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three - Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  daysInput: {
    width: 96,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three - Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
