import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { deliveryToast } from '@/features/reminders/delivery-toast';
import { PermissionPrompt } from '@/features/reminders/permission-prompt';
import {
  atTime,
  nextOccurrence,
  parseDateKey,
  scheduleSummary,
  toDateKey,
  toTimeKey,
  WEEK_ORDER,
} from '@/features/reminders/recurrence';
import { shouldExplainPermission, useReminders } from '@/features/reminders/reminders-store';
import type { EndType, Reminder, ReminderDraft, RepeatType } from '@/features/reminders/types';
import { useTheme } from '@/hooks/use-theme';
import { addDays, formatLongDate, formatTime, startOfDay, weekdayName, WEEKDAYS } from '@/utils/date';

type Repeating = Exclude<RepeatType, 'none'>;

const REPEAT_OPTIONS: { value: Repeating; label: string }[] = [
  { value: 'daily', label: 'يوميًا' },
  { value: 'selected_weekdays', label: 'في أيام محددة' },
  { value: 'weekly', label: 'أسبوعيًا' },
  { value: 'every_n_days', label: 'كل عدد معين من الأيام' },
];

const INTERVAL_PRESETS = [
  { days: 7, label: '7 أيام' },
  { days: 14, label: '14 يومًا' },
  { days: 30, label: '30 يومًا' },
];

const END_OPTIONS: { value: EndType; label: string }[] = [
  { value: 'never', label: 'بدون تاريخ انتهاء' },
  { value: 'on_date', label: 'في تاريخ معين' },
  { value: 'after_occurrences', label: 'بعد عدد من المرات' },
];

type SnoozeChoice = 10 | 30 | 60 | 'custom';

const SNOOZE_OPTIONS: { value: SnoozeChoice; label: string }[] = [
  { value: 10, label: 'بعد 10 دقائق' },
  { value: 30, label: 'بعد 30 دقيقة' },
  { value: 60, label: 'بعد ساعة' },
  { value: 'custom', label: 'وقت مخصص' },
];

/** Whole positive numbers only; Arabic-Indic digits typed on an Arabic keyboard count too. */
function toCount(text: string) {
  const latin = text.trim().replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
  return /^\d+$/.test(latin) && Number(latin) > 0 ? Number(latin) : null;
}

/** A new reminder starts tomorrow at 09:00 صباحًا. */
function defaultStart() {
  return atTime(addDays(startOfDay(new Date()), 1), '09:00');
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

/** Back to where the form was opened from, or to the list when it was opened directly (a link or a notification). */
function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/reminders');
}

/** Create/edit form shared by /reminders/new and /reminders/[id]/edit. */
export function ReminderForm({ reminder }: { reminder?: Reminder }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const store = useReminders();
  const showToast = useToast();

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [message, setMessage] = useState(reminder?.message ?? '');
  const [startsAt, setStartsAt] = useState(() =>
    reminder ? atTime(parseDateKey(reminder.startDate), reminder.time) : defaultStart(),
  );
  const [repeats, setRepeats] = useState(reminder ? reminder.repeatType !== 'none' : false);
  const [repeatType, setRepeatType] = useState<Repeating>(
    reminder && reminder.repeatType !== 'none' ? reminder.repeatType : 'daily',
  );
  const [weekdays, setWeekdays] = useState(() =>
    reminder?.selectedWeekdays.length ? reminder.selectedWeekdays : [startsAt.getDay()],
  );
  const [intervalText, setIntervalText] = useState(String(reminder?.intervalDays ?? 14));
  const [endType, setEndType] = useState<EndType>(reminder?.endType ?? 'never');
  const [endDate, setEndDate] = useState(reminder?.endDate ? parseDateKey(reminder.endDate) : null);
  const [maxText, setMaxText] = useState(String(reminder?.maxOccurrences ?? 10));
  const [snoozeChoice, setSnoozeChoice] = useState<SnoozeChoice>(() => {
    const minutes = reminder?.snoozeMinutes ?? 60;
    return minutes === 10 || minutes === 30 || minutes === 60 ? minutes : 'custom';
  });
  const [snoozeText, setSnoozeText] = useState(String(reminder?.snoozeMinutes ?? 15));
  // Errors show after the first save attempt, not while the member is still typing.
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [explainPermission, setExplainPermission] = useState(false);

  const draft: ReminderDraft = {
    title,
    message,
    startDate: toDateKey(startsAt),
    time: toTimeKey(startsAt),
    repeatType: repeats ? repeatType : 'none',
    selectedWeekdays: weekdays,
    intervalDays: toCount(intervalText),
    endType: repeats ? endType : 'never',
    endDate: endDate ? toDateKey(endDate) : null,
    maxOccurrences: toCount(maxText),
    // Always exact; the app asks for "المنبهات والتذكيرات" at launch instead of per reminder.
    exactTiming: true,
    snoozeMinutes: snoozeChoice === 'custom' ? (toCount(snoozeText) ?? 0) : snoozeChoice,
  };

  const now = new Date();
  const errors = {
    title: title.trim() ? '' : 'اكتب عنوانًا للتذكير.',
    startsAt: !repeats && startsAt <= now ? 'هذا الموعد مضى. اختر وقتًا قادمًا.' : '',
    weekdays: repeats && repeatType === 'selected_weekdays' && weekdays.length === 0 ? 'اختر يومًا واحدًا على الأقل.' : '',
    interval:
      repeats && repeatType === 'every_n_days' && !draft.intervalDays ? 'يجب أن يكون عدد الأيام رقمًا أكبر من صفر.' : '',
    endDate: !repeats || endType !== 'on_date'
      ? ''
      : !endDate
        ? 'اختر تاريخ الانتهاء.'
        : endDate < startOfDay(startsAt)
          ? 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البداية.'
          : '',
    maxOccurrences:
      repeats && endType === 'after_occurrences' && !draft.maxOccurrences ? 'اكتب عدد مرات أكبر من صفر.' : '',
    snooze: draft.snoozeMinutes > 0 ? '' : 'اكتب عدد دقائق أكبر من صفر.',
  };
  const ruleIncomplete = Boolean(errors.weekdays || errors.interval || errors.endDate || errors.maxOccurrences);
  const hasFuture = !ruleIncomplete && !!nextOccurrence(draft, now);
  const shown = (field: keyof typeof errors) => (submitted ? errors[field] : '');

  const persist = async () => {
    setSaving(true);
    try {
      const { delivery } = await store.save(draft, reminder?.id);
      close();
      showToast(deliveryToast(delivery, reminder ? 'تم تحديث التذكير بنجاح.' : 'تم إنشاء التذكير وسيصلك في موعده.'));
    } catch {
      // Stay on the form so nothing the member typed is lost.
      setSaving(false);
      showToast({ tone: 'danger', message: 'تعذر حفظ التذكير على هاتفك. حاول مرة أخرى.' });
    }
  };

  const onSave = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !hasFuture) return;
    // Permission is asked for on the first save, after explaining why, not at app launch.
    if (shouldExplainPermission(store)) setExplainPermission(true);
    else persist();
  };

  // Changing the date keeps the chosen time, and vice versa.
  const setDate = (day: Date) => {
    // While the chosen weekdays are just the start date's day, they follow the date.
    if (weekdays.length === 1 && weekdays[0] === startsAt.getDay()) setWeekdays([day.getDay()]);
    setStartsAt(atTime(day, toTimeKey(startsAt)));
  };
  const chooseRepeatType = (type: Repeating) => {
    // "في أيام محددة" starts with the start date's day selected.
    if (type === 'selected_weekdays' && !weekdays.includes(startsAt.getDay())) {
      setWeekdays([...weekdays, startsAt.getDay()]);
    }
    setRepeatType(type);
  };
  const setTime = (time: Date) => setStartsAt(atTime(startsAt, toTimeKey(time)));
  const toggleWeekday = (day: number) =>
    setWeekdays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));

  const inputStyle = [styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }];
  const summaryText = ruleIncomplete ? 'أكمل إعدادات التكرار لعرض الملخص.' : scheduleSummary(draft, now);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="عنوان التذكير" required error={shown('title')}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="مثال: التواصل مع المسؤول"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="عنوان التذكير"
            maxLength={120}
            style={inputStyle}
          />
        </Field>

        <Field label="رسالة التذكير">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="اكتب ما تريد أن تتذكره"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="رسالة التذكير"
            multiline
            maxLength={500}
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <View style={styles.pair}>
          <Field label="التاريخ" required error={shown('startsAt')} style={styles.grow}>
            <PickerButton
              icon="calendar_today"
              text={formatLongDate(startsAt)}
              accessibilityLabel={`التاريخ: ${formatLongDate(startsAt)}`}
              onPress={() => openPicker('date', startsAt, setDate)}
            />
          </Field>
          <Field label="الوقت" required style={styles.grow}>
            <PickerButton
              icon="schedule"
              text={formatTime(startsAt)}
              accessibilityLabel={`الوقت: ${formatTime(startsAt)}`}
              onPress={() => openPicker('time', startsAt, setTime)}
            />
          </Field>
        </View>

        <Section>
          <SwitchRow label="تكرار التذكير" value={repeats} onChange={setRepeats} />

          {repeats && (
            <>
              <View style={styles.chips}>
                {REPEAT_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    selected={repeatType === option.value}
                    onPress={() => chooseRepeatType(option.value)}
                  />
                ))}
              </View>

              {repeatType === 'weekly' && (
                <Hint text={`يتكرر كل أسبوع يوم ${weekdayName(startsAt)}، حسب التاريخ الذي اخترته.`} />
              )}

              {repeatType === 'selected_weekdays' && (
                <Field label="أيام التذكير" error={shown('weekdays')}>
                  <View style={styles.chips}>
                    {WEEK_ORDER.map((day) => (
                      <ChoiceChip
                        key={day}
                        label={WEEKDAYS[day]}
                        selected={weekdays.includes(day)}
                        onPress={() => toggleWeekday(day)}
                      />
                    ))}
                  </View>
                </Field>
              )}

              {repeatType === 'every_n_days' && (
                <Field label="كرّر كل" error={shown('interval')}>
                  <NumberInput value={intervalText} onChange={setIntervalText} suffix="يوم" label="عدد الأيام" />
                  <View style={styles.chips}>
                    {INTERVAL_PRESETS.map((preset) => (
                      <ChoiceChip
                        key={preset.days}
                        label={preset.label}
                        selected={draft.intervalDays === preset.days}
                        onPress={() => setIntervalText(String(preset.days))}
                      />
                    ))}
                  </View>
                </Field>
              )}

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Field label="نهاية التكرار" error={shown('endDate') || shown('maxOccurrences')}>
                <View style={styles.chips}>
                  {END_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={endType === option.value}
                      onPress={() => setEndType(option.value)}
                    />
                  ))}
                </View>
                {endType === 'on_date' && (
                  <PickerButton
                    icon="event"
                    text={endDate ? formatLongDate(endDate) : 'اختر تاريخ الانتهاء'}
                    muted={!endDate}
                    accessibilityLabel={endDate ? `تاريخ الانتهاء: ${formatLongDate(endDate)}` : 'اختر تاريخ الانتهاء'}
                    onPress={() => openPicker('date', endDate ?? addDays(startsAt, 30), (day) => setEndDate(startOfDay(day)))}
                  />
                )}
                {endType === 'after_occurrences' && (
                  <NumberInput value={maxText} onChange={setMaxText} suffix="مرات" label="عدد المرات" />
                )}
              </Field>
            </>
          )}
        </Section>

        <Section>
          <Field label="عند اختيار ذكّرني لاحقًا" error={shown('snooze')}>
            <View style={styles.chips}>
              {SNOOZE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={snoozeChoice === option.value}
                  onPress={() => setSnoozeChoice(option.value)}
                />
              ))}
            </View>
            {snoozeChoice === 'custom' && (
              <NumberInput value={snoozeText} onChange={setSnoozeText} suffix="دقيقة" label="عدد الدقائق" />
            )}
          </Field>
        </Section>

        <View
          accessibilityLiveRegion="polite"
          style={[styles.summary, { backgroundColor: hasFuture || ruleIncomplete ? theme.primarySoft : theme.warningSoft }]}>
          <Icon name="event_upcoming" color={hasFuture || ruleIncomplete ? theme.primary : theme.warning} />
          <ThemedText
            type="small"
            themeColor={hasFuture || ruleIncomplete ? 'primary' : 'warning'}
            style={styles.grow}>
            {summaryText}
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button label="حفظ التذكير" icon="check" disabled={saving} onPress={onSave} style={styles.grow} />
        <Button label="إلغاء" variant="tonal" disabled={saving} onPress={close} />
      </View>

      <PermissionPrompt
        visible={explainPermission}
        onAllow={async () => {
          setExplainPermission(false);
          await store.requestPermission().catch(() => undefined);
          persist();
        }}
        onLater={() => {
          setExplainPermission(false);
          store.dismissPermissionPrompt();
          persist();
        }}
      />
    </View>
  );
}

function Section({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>;
}

function SwitchRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.switchRow}>
      <View style={styles.grow}>
        <ThemedText type="label">{label}</ThemedText>
        {description && (
          <ThemedText type="caption" themeColor="textSecondary">
            {description}
          </ThemedText>
        )}
      </View>
      <Switch
        importantForAccessibility="no-hide-descendants"
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.primary, false: theme.border }}
        thumbColor={theme.surface}
      />
    </Pressable>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <View style={styles.hint}>
      <Icon name="info" size={16} />
      <ThemedText type="caption" themeColor="textSecondary" style={styles.grow}>
        {text}
      </ThemedText>
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
  const theme = useTheme();

  return (
    <View style={[styles.field, style]}>
      <ThemedText type="label">
        {label}
        {required && <ThemedText type="label" themeColor="danger"> *</ThemedText>}
      </ThemedText>
      {children}
      {!!error && (
        <View style={styles.error}>
          <Icon name="error" size={14} color={theme.danger} />
          <ThemedText type="caption" themeColor="danger" style={styles.grow}>
            {error}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  label,
}: {
  value: string;
  onChange: (text: string) => void;
  suffix: string;
  label: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.numberRow}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={4}
        accessibilityLabel={label}
        style={[
          styles.input,
          styles.numberInput,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
        ]}
      />
      <ThemedText themeColor="textSecondary">{suffix}</ThemedText>
    </View>
  );
}

function PickerButton({
  icon,
  text,
  muted,
  accessibilityLabel,
  onPress,
}: {
  icon: IconName;
  text: string;
  muted?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.input, styles.pickerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Icon name={icon} size={18} color={theme.primary} />
      <ThemedText themeColor={muted ? 'textSecondary' : 'text'} numberOfLines={1} style={styles.grow}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      {selected && <Icon name="check" size={16} color={theme.onPrimary} />}
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
    minHeight: 44,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  numberInput: {
    width: 88,
    textAlign: 'center',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
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
