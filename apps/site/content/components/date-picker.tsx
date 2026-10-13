import { ExampleViewer } from '../../components/example-viewer';
import { DateFieldExample } from '../../examples/date-picker/date-field';
import { DatePickerBasic } from '../../examples/date-picker/date-picker-basic';
import { DateRangeExample } from '../../examples/date-picker/date-range';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const c = 'text-on-surface';

/** Date picker page body. */
export async function DatePickerBody() {
  const [basic, range, docked] = await Promise.all([
    readExampleSource('date-picker/date-picker-basic.tsx'),
    readExampleSource('date-picker/date-range.tsx'),
    readExampleSource('date-picker/date-field.tsx'),
  ]);
  const [basicHtml, rangeHtml, dockedHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(range),
    highlightSource(docked),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Date pickers let someone choose a date, or a range of dates. M3 has three variants: the{' '}
          <strong className={c}>docked date picker</strong> (<code className={c}>DateField</code>),
          a date field with a calendar just below it, best on medium and larger windows; the{' '}
          <strong className={c}>modal date picker</strong> (<code className={c}>DatePicker</code> or{' '}
          <code className={c}>DateRangePicker</code> in a <code className={c}>PickerDialog</code>),
          full screen on compact windows; and the <strong className={c}>modal date input</strong>,
          the modal picker&apos;s typed mode behind its edit button.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Values are <code className={c}>@internationalized/date</code>{' '}
          <code className={c}>CalendarDate</code>s (a <code className={c}>{'{ start, end }'}</code>{' '}
          pair for a range). Each is controlled (<code className={c}>value</code> /{' '}
          <code className={c}>onChange</code>) or uncontrolled (
          <code className={c}>defaultValue</code>), and words are localised through the{' '}
          <code className={c}>strings</code> prop. For a date far in the past or future, such as a
          date of birth, prefer the docked picker or the typed input to paging the calendar.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Docked date picker"
          code={docked}
          html={dockedHtml}
          fileName="date-field.tsx"
          tabbed
        >
          <DateFieldExample />
        </ExampleViewer>
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
            The grid is a React Aria calendar: arrow keys move by day, Page Up / Down by month,
            Shift+Page Up / Down by year, Home / End to the ends of the month, honouring{' '}
            <code className={c}>minValue</code> / <code className={c}>maxValue</code> and{' '}
            <code className={c}>isDateUnavailable</code>. Each day is named by its full date, and
            the weekdays are column headers named by their full name (also shown on hover).
          </li>
          <li>
            Enter on a day closes the calendar and saves it: in the docked picker, and in a{' '}
            <code className={c}>PickerDialog</code> given <code className={c}>onConfirm</code> (for
            a range, once both ends are picked). Shift+M moves to the month menu and Shift+Y to the
            year menu; the previous / next buttons&apos; tooltips name their shortcuts.
          </li>
          <li>
            The typed date has no input mask: it accepts dashes, spaces, slashes or dots and an
            optional leading zero, and is reformatted only on Enter or when you leave the field. The
            locale&apos;s format (&quot;MM/DD/YYYY&quot;) is its helper text and placeholder, and a
            date that can&apos;t be used is explained in the supporting text.
          </li>
          <li>
            Years and months are radio groups; arrow keys move between them, and those outside{' '}
            <code className={c}>minValue</code> / <code className={c}>maxValue</code> are shown
            disabled. The headline is an <code className={c}>aria-live=&quot;polite&quot;</code>{' '}
            region, so the selection is announced. Every day, year and month is a 48px target.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            360px wide with Compose&apos;s header, 56px month row, weekday row and six 48px week
            rows (the height is kept at six). Days are 40px circles: selected{' '}
            <code className={c}>primary</code> / <code className={c}>on-primary</code>, today a 1px{' '}
            <code className={c}>primary</code> outline, disabled at 38%.
          </li>
          <li>
            The modal picker pages months with the arrows, a horizontal swipe or the keyboard, and
            each month slides in from its side (a fade with reduced motion). The range picker
            scrolls a vertical list of months, each under a <code className={c}>title-small</code>{' '}
            subhead; <code className={c}>monthLayout=&quot;paged&quot;</code> pages it instead.
          </li>
          <li>
            In a range, the ends are filled and the days between sit on a 40px{' '}
            <code className={c}>secondary-container</code> band drawn as cell background gradients,
            so nothing is positioned (it mirrors in RTL).
          </li>
          <li>
            The docked calendar is a <code className={c}>surface-container-high</code> panel with
            16px corners at level 3, with month and year menu buttons between previous / next
            buttons, the days of the months around in <code className={c}>on-surface-variant</code>,
            and Cancel / OK.
          </li>
        </ul>
      </section>
    </>
  );
}
