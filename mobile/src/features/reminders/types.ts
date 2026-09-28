export type RepeatType = 'none' | 'daily' | 'selected_weekdays' | 'weekly' | 'every_n_days';

export type EndType = 'never' | 'on_date' | 'after_occurrences';

export type ReminderStatus = 'active' | 'completed' | 'archived';

/**
 * A private reminder stored only on this phone.
 *
 * The schedule is kept as local calendar values ("2026-09-30" and "09:00"), not instants, so a
 * reminder keeps its wall-clock time when the phone moves to another timezone. Instants such as
 * `nextOccurrenceAt` are ISO strings recalculated from those values.
 */
export type Reminder = {
  /** UUID. */
  id: string;
  title: string;
  /** Empty when the member wrote no message. */
  message: string;
  /** First day, "YYYY-MM-DD". */
  startDate: string;
  /** Time of every alert, "HH:mm" (24-hour). */
  time: string;
  /** Device timezone when the reminder was last scheduled. */
  timezone: string;
  repeatType: RepeatType;
  /** For `selected_weekdays`: 0 = Sunday … 6 = Saturday. Weekly reminders use the start date's weekday. */
  selectedWeekdays: number[];
  /** For `every_n_days`. */
  intervalDays: number | null;
  endType: EndType;
  /** For `on_date`: last day, "YYYY-MM-DD", inclusive. */
  endDate: string | null;
  /** For `after_occurrences`: how many alerts in total, counted from the start date. */
  maxOccurrences: number | null;
  /** The member asked for on-the-minute alerts, which needs an extra permission on Android 12+. */
  exactTiming: boolean;
  snoozeMinutes: number;
  isEnabled: boolean;
  status: ReminderStatus;
  nextOccurrenceAt: string | null;
  /** Latest occurrence known to have reached the member, or that they dealt with. */
  lastTriggeredAt: string | null;
  /** An occurrence that passed without a notification; shown under "تذكيرات فائتة" until handled. */
  missedAt: string | null;
  /** Identifiers of the notifications currently scheduled with the OS for this reminder. */
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

/** The recurrence fields, which are all that's needed to work out when a reminder fires. */
export type RecurrenceRule = Pick<
  Reminder,
  'startDate' | 'time' | 'repeatType' | 'selectedWeekdays' | 'intervalDays' | 'endType' | 'endDate' | 'maxOccurrences'
>;

/** What the create/edit form fills in; the rest is managed by the reminders service. */
export type ReminderDraft = RecurrenceRule &
  Pick<Reminder, 'title' | 'message' | 'exactTiming' | 'snoozeMinutes'>;
