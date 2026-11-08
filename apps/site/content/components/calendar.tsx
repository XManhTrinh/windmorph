import type { ComponentDoc } from './doc';
import { calendarTokenSet } from '@windmorph/react-pro/calendar';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'toolbar',
  'title',
  'navigation',
  'todayButton',
  'viewSwitch',
  'grid',
  'header',
  'headerCell',
  'resourceHeader',
  'allDayRow',
  'timeGutter',
  'slot',
  'cell',
  'dayNumber',
  'event',
  'eventTitle',
  'eventTime',
  'more',
  'nowLine',
  'blocked',
  'businessHours',
  'dragPreview',
  'selectionRange',
  'agendaGroup',
  'agendaRow',
  'loading',
  'empty',
  'liveRegion',
];

/** Calendar page body: examples, when to use it, behaviour, parts and tokens. */
export async function CalendarBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Month, week, day and agenda',
      file: 'calendar/calendar-views',
      name: 'CalendarViews',
    },
    {
      title: 'Move, resize and select',
      file: 'calendar/calendar-editing',
      name: 'CalendarEditing',
    },
    {
      title: 'Rooms: a schedule and a timeline',
      file: 'calendar/calendar-resources',
      name: 'CalendarResources',
    },
  ]);
  return {
    overview,
    guidelines: (
      <>
        <section className={SECTION}>
          <h2 id="purpose" className={HEADING}>
            Purpose
          </h2>
          <p className={TEXT}>
            An event calendar for any product: appointments, shifts, rooms, deliveries, time off. It
            knows nothing about the business: the app passes events and answers changes. Import it
            from <InlineCode>@windmorph/react-pro/calendar</InlineCode>, with{' '}
            <InlineCode>@tanstack/react-virtual</InlineCode> installed. To pick one date in a form,
            use a DatePicker.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Events are absolute: a <InlineCode>ZonedDateTime</InlineCode>, an ISO string with an
              offset, or a <InlineCode>Date</InlineCode>, drawn in <InlineCode>timeZone</InlineCode>
              . An all-day event takes days, and its <InlineCode>end</InlineCode> is the last day,
              inclusive.
            </li>
            <li>
              Slots are worked out in zoned time, so a 23 or 25-hour day is drawn correctly: a
              repeated hour gets its own rows, and a time a day doesn&apos;t have shows as absent.
            </li>
            <li>
              Pass <InlineCode>timeZone</InlineCode> and <InlineCode>now</InlineCode> for server
              rendering: the first render is then stable, and the current-time line appears after
              hydration.
            </li>
            <li>
              Selecting, moving and resizing work by pointer, by keyboard, and on touch by long
              press, so scrolling is never captured. An event&apos;s menu holds the same moves on
              touch.
            </li>
            <li>
              <InlineCode>onSelectRange</InlineCode>, <InlineCode>onEventMove</InlineCode> and{' '}
              <InlineCode>onEventResize</InlineCode> may return <InlineCode>false</InlineCode> to
              reject, an adjusted value, or a promise of either. Data stays yours, so apply the
              change to <InlineCode>events</InlineCode>.
            </li>
            <li>
              Recurrence is the app&apos;s: pass each occurrence. Overlaps sit side by side, and{' '}
              <InlineCode>maxEventsPerDay</InlineCode> limits a month cell before “+N more”.
            </li>
            <li>Below 600px of its own width the default offers the day and agenda views.</li>
            <li>
              <InlineCode>useCalendarState</InlineCode> and the exported views and toolbar compose
              the same pieces differently.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the calendar or any ancestor. An event&apos;s{' '}
          <InlineCode>color</InlineCode> picks one of its role tokens. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={calendarTokenSet} caption="Calendar tokens" />
      </section>
    ),
  };
}
