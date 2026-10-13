import { ExampleViewer } from '../../components/example-viewer';
import { DatePickerBasic } from '../../examples/date-picker/date-picker-basic';
import { DateRangeExample } from '../../examples/date-picker/date-range';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Date picker page body. */
export async function DatePickerBody() {
  const [basic, range] = await Promise.all([
    readExampleSource('date-picker/date-picker-basic.tsx'),
    readExampleSource('date-picker/date-range.tsx'),
  ]);
  const [basicHtml, rangeHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(range),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The date picker lets someone choose a single date, and the date range picker a start and
          an end date, on a month grid or by typing in input mode. Both render just the picker
          content; wrap one in a <code className="text-on-surface">PickerDialog</code> for the modal
          form with confirm and cancel actions.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Values are <code className="text-on-surface">@internationalized/date</code>{' '}
          <code className="text-on-surface">CalendarDate</code>s (a{' '}
          <code className="text-on-surface">{'{ start, end }'}</code> pair for a range). Each is
          controlled (<code className="text-on-surface">value</code> /{' '}
          <code className="text-on-surface">onChange</code>) or uncontrolled (
          <code className="text-on-surface">defaultValue</code>), and labels are localised through
          the <code className="text-on-surface">strings</code> prop.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Date picker"
          code={basic}
          html={basicHtml}
          fileName="date-picker-basic.tsx"
          tabbed
        >
          <DatePickerBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Date range picker"
          code={range}
          html={rangeHtml}
          fileName="date-range.tsx"
          tabbed
        >
          <DateRangeExample />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The grid is a React Aria calendar: arrow keys move by day, Page Up / Down by month, Home
            / End to the ends of a row, honouring <code className="text-on-surface">minValue</code>{' '}
            / <code className="text-on-surface">maxValue</code> and{' '}
            <code className="text-on-surface">isDateUnavailable</code>.
          </li>
          <li>
            The year list is a radio group reached from the month button; arrow keys move between
            years. The headline is an{' '}
            <code className="text-on-surface">aria-live=&quot;polite&quot;</code> region, so the
            selection is announced.
          </li>
          <li>
            Input mode uses React Aria date-field segments: type or arrow a segment, with validation
            messages when a date is out of range. The calendar follows the locale&apos;s first
            weekday and keyboard direction (via{' '}
            <code className="text-on-surface">DomDirectionLocale</code>).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            360px wide with Compose&apos;s header, 56px month row, weekday row and six 48px week
            rows (the height is kept at six). Days are 40px circles: selected{' '}
            <code className="text-on-surface">primary</code> /{' '}
            <code className="text-on-surface">on-primary</code>, today a 1px{' '}
            <code className="text-on-surface">primary</code> outline, disabled at 38%.
          </li>
          <li>
            In a range, the ends are filled and the days between sit on a 40px{' '}
            <code className="text-on-surface">secondary-container</code> band drawn as cell
            background gradients, so nothing is positioned (it mirrors in RTL).{' '}
            <strong className="text-on-surface">Deviation:</strong> the range picker pages month by
            month rather than scrolling a vertical list of months.
          </li>
          <li>
            Chrome icons (chevrons, dropdown, edit, calendar) are inline Material Symbols SVGs, like
            other components&apos; own controls; the chevrons mirror in RTL.
          </li>
          <li>
            <strong className="text-on-surface">Not in v1:</strong> the docked date picker (a field
            with a dropdown calendar), landscape layouts, and selectable-date callbacks beyond{' '}
            <code className="text-on-surface">isDateUnavailable</code>.
          </li>
        </ul>
      </section>
    </>
  );
}
