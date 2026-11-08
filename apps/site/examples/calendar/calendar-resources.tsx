'use client';

import {
  Calendar,
  type CalendarEventInput,
  type CalendarResource,
} from '@windmorph/react-pro/calendar';

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

const RESOURCES: CalendarResource[] = [
  { id: 'room-a', title: 'Room A' },
  { id: 'room-b', title: 'Room B' },
  { id: 'room-c', title: 'Room C' },
];

/** A column or a row per resource, with open hours and a span that can't be booked. */
export function CalendarResources() {
  return (
    <div className="w-full">
      <Calendar
        aria-label="Rooms"
        events={EVENTS}
        resources={RESOURCES}
        timeZone="UTC"
        now="2026-11-11T08:00:00Z"
        defaultDate="2026-11-11"
        defaultView="resource-timeline"
        views={['resource-schedule', 'resource-timeline']}
        visibleHours={[7, 17]}
        businessHours={[{ from: 9, to: 17 }]}
        blockedRanges={[
          { start: '2026-11-11T12:00:00Z', end: '2026-11-11T13:00:00Z', selectable: false },
        ]}
      />
    </div>
  );
}
