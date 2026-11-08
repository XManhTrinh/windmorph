'use client';

import { Calendar, type CalendarEventInput } from '@windmorph/react-pro/calendar';

const EVENTS: CalendarEventInput[] = [
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-11-11T09:00:00Z',
    end: '2026-11-11T09:30:00Z',
    status: 'Confirmed',
    resourceIds: ['room-a'],
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-11-11T09:00:00Z',
    end: '2026-11-11T10:30:00Z',
    color: 'tertiary',
    resourceIds: ['room-b'],
  },
  {
    id: 'visit',
    title: 'Site visit',
    start: '2026-11-12T13:00:00Z',
    end: '2026-11-12T15:00:00Z',
    color: 'secondary',
    status: 'Tentative',
    resourceIds: ['room-a'],
  },
  { id: 'trip', title: 'Conference', allDay: true, start: '2026-11-16', end: '2026-11-18' },
];

/** The month, week, day and agenda views, with a display zone and a stable first render. */
export function CalendarViews() {
  return (
    <div className="w-full">
      <Calendar
        aria-label="Bookings"
        events={EVENTS}
        timeZone="UTC"
        now="2026-11-11T08:00:00Z"
        defaultDate="2026-11-11"
        visibleHours={[7, 17]}
      />
    </div>
  );
}
