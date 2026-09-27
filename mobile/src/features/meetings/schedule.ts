import type { Meeting } from '@/features/meetings/types';

/** Meetings that haven't started yet, soonest first. */
export function upcomingMeetings(meetings: Meeting[], now = new Date()) {
  return meetings
    .filter((meeting) => meeting.startsAt > now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Meetings that have already started, most recent first. */
export function pastMeetings(meetings: Meeting[], now = new Date()) {
  return meetings
    .filter((meeting) => meeting.startsAt <= now)
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
}
