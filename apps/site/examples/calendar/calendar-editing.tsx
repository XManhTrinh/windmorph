'use client';

import {
  Calendar,
  type CalendarEventChange,
  type CalendarEventInput,
} from '@windmorph/react-pro/calendar';
import { useState } from 'react';

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

/** Drag, resize and select by pointer, long press or keyboard; the app applies each change. */
export function CalendarEditing() {
  const [events, setEvents] = useState(EVENTS);
  const [message, setMessage] = useState('');
  const apply = (change: CalendarEventChange) =>
    setEvents((current) =>
      current.map((event) =>
        event.id === change.event.id
          ? { ...event, start: change.start, end: change.end, resourceIds: change.resourceIds }
          : event,
      ),
    );
  return (
    <div className="flex w-full flex-col gap-2">
      <Calendar
        aria-label="Editable bookings"
        events={events}
        timeZone="UTC"
        now="2026-11-11T08:00:00Z"
        defaultDate="2026-11-11"
        defaultView="week"
        visibleHours={[7, 17]}
        onEventMove={apply}
        onEventResize={apply}
        onEventAction={(event) => setMessage(`Opened ${event.title}`)}
        onSelectRange={(range) => setMessage(`Selected from ${range.start.toString()}`)}
      />
      <p role="status" className="text-body-medium text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}
