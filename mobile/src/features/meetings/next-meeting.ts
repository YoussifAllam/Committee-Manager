import type { Meeting } from '@/features/meetings/types';

/** The soonest meeting that hasn't started yet, optionally limited to one committee. */
export function findNextMeeting(meetings: Meeting[], committeeId?: string, now = new Date()) {
  return meetings
    .filter((meeting) => meeting.startsAt > now && (!committeeId || meeting.committeeId === committeeId))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
}
