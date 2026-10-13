import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { DateFieldExample } from '../../examples/date-picker/date-field';
import { DatePickerBasic } from '../../examples/date-picker/date-picker-basic';
import { DateRangeExample } from '../../examples/date-picker/date-range';
import { DateInput } from '../../examples/date-picker/date-input';
import { DateRangeModal } from '../../examples/date-picker/date-range-modal';
import { DatePickerModal } from '../../examples/date-picker/date-picker-modal';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

const c = 'text-on-surface';

/** Date picker page body. */
export async function DatePickerBody(): Promise<ComponentDoc> {
  const [basic, range, docked, datePickerModal, dateRangeModal, dateInput] = await Promise.all([
    readExampleSource('date-picker/date-picker-basic.tsx'),
    readExampleSource('date-picker/date-range.tsx'),
    readExampleSource('date-picker/date-field.tsx'),
    readExampleSource('date-picker/date-picker-modal.tsx'),
    readExampleSource('date-picker/date-range-modal.tsx'),
    readExampleSource('date-picker/date-input.tsx'),
  ]);
  const [basicHtml, rangeHtml, dockedHtml, datePickerModalHtml, dateRangeModalHtml, dateInputHtml] =
    await Promise.all([
      highlightSource(basic),
      highlightSource(range),
      highlightSource(docked),
      highlightSource(datePickerModal),
      highlightSource(dateRangeModal),
      highlightSource(dateInput),
    ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
            title="Modal date picker"
            code={datePickerModal}
            html={datePickerModalHtml}
            fileName="date-picker-modal.tsx"
          >
            <DatePickerModal />
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
          <ExampleViewer
            title="Modal date range picker"
            code={dateRangeModal}
            html={dateRangeModalHtml}
            fileName="date-range-modal.tsx"
          >
            <DateRangeModal />
          </ExampleViewer>
          <ExampleViewer
            title="Modal date input"
            code={dateInput}
            html={dateInputHtml}
            fileName="date-input.tsx"
          >
            <DateInput />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Date pickers let someone choose a date, or a range of dates. M3 has three variants: the{' '}
            <strong className={c}>docked date picker</strong> (<InlineCode>DateField</InlineCode>),
            a date field with a calendar just below it, best on medium and larger windows; the{' '}
            <strong className={c}>modal date picker</strong> (<InlineCode>DatePicker</InlineCode> or{' '}
            <InlineCode>DateRangePicker</InlineCode> in a <InlineCode>PickerDialog</InlineCode>),
            full screen on compact windows; and the <strong className={c}>modal date input</strong>,
            the modal picker&apos;s typed mode behind its edit button.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Values are <InlineCode>@internationalized/date</InlineCode>{' '}
            <InlineCode>CalendarDate</InlineCode>s (a <InlineCode>{'{ start, end }'}</InlineCode>{' '}
            pair for a range). Each is controlled (<InlineCode>value</InlineCode> /{' '}
            <InlineCode>onChange</InlineCode>) or uncontrolled (
            <InlineCode>defaultValue</InlineCode>
            ), and words are localised through the <InlineCode>strings</InlineCode> prop. For a date
            far in the past or future, such as a date of birth, prefer the docked picker or the
            typed input to paging the calendar. The typed input is titled &quot;Enter date&quot;
            (&quot;Enter dates&quot; for a range), as the M3 modal date input is;{' '}
            <InlineCode>strings.inputTitle</InlineCode> words it for the task.
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The grid is a React Aria calendar: arrow keys move by day, Page Up / Down by month,
              Shift+Page Up / Down by year, Home / End to the ends of the month, honouring{' '}
              <InlineCode>minValue</InlineCode> / <InlineCode>maxValue</InlineCode> and{' '}
              <InlineCode>isDateUnavailable</InlineCode>. Each day is named by its full date, and
              the weekdays are column headers named by their full name (also shown on hover).
            </li>
            <li>
              Enter on a day closes the calendar and saves it: in the docked picker, and in a{' '}
              <InlineCode>PickerDialog</InlineCode> given <InlineCode>onConfirm</InlineCode> (for a
              range, once both ends are picked). Shift+M moves to the month menu and Shift+Y to the
              year menu; the previous / next buttons&apos; tooltips name their shortcuts.
            </li>
            <li>
              The typed date has no input mask: it accepts dashes, spaces, slashes or dots and an
              optional leading zero, and is reformatted only on Enter or when you leave the field.
              The locale&apos;s format (&quot;MM/DD/YYYY&quot;) is its helper text and placeholder,
              and a date that can&apos;t be used is explained in the supporting text.
            </li>
            <li>
              Years and months are radio groups; arrow keys move between them, and those outside{' '}
              <InlineCode>minValue</InlineCode> / <InlineCode>maxValue</InlineCode> are shown
              disabled. The headline is an <InlineCode>aria-live=&quot;polite&quot;</InlineCode>{' '}
              region, so the selection is announced. Every day, year and month is a 48px target.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              360px wide with Compose&apos;s header, 56px month row, weekday row and six 48px week
              rows (the height is kept at six). Days are 40px circles: selected{' '}
              <InlineCode>primary</InlineCode> / <InlineCode>on-primary</InlineCode>, today a 1px{' '}
              <InlineCode>primary</InlineCode> outline, disabled at 38%.
            </li>
            <li>
              The modal picker pages months with the arrows, a horizontal swipe or the keyboard, and
              each month slides in from its side (a fade with reduced motion). The range picker
              scrolls a vertical list of months, each under a <InlineCode>title-small</InlineCode>{' '}
              subhead; <InlineCode>monthLayout=&quot;paged&quot;</InlineCode> pages it instead.
            </li>
            <li>
              In a range, the ends are filled and the days between sit on a 40px{' '}
              <InlineCode>secondary-container</InlineCode> band drawn as cell background gradients,
              so nothing is positioned (it mirrors in RTL).
            </li>
            <li>
              The docked calendar is a <InlineCode>surface-container-high</InlineCode> panel with
              16px corners at level 3, with month and year menu buttons between previous / next
              buttons, the days of the months around in <InlineCode>on-surface-variant</InlineCode>,
              and Cancel / OK.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
