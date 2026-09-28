export type Repeat =
  | { kind: 'none' }
  /** Weekday numbers, 0 = Sunday … 6 = Saturday. */
  | { kind: 'weekly'; weekdays: number[] }
  | { kind: 'interval'; days: number };

/** A private reminder: only the member who created it sees it. */
export type Reminder = {
  id: string;
  title: string;
  message: string;
  /** Date and time of the first alert; repeats keep its time of day. */
  startsAt: Date;
  repeat: Repeat;
  /** Last day a repeating reminder may fire. */
  endsOn?: Date;
  enabled: boolean;
};
