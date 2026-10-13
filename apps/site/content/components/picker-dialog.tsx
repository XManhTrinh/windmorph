import { ExampleViewer } from '../../components/example-viewer';
import { PickerDialogDate } from '../../examples/picker-dialog/picker-dialog-date';
import { PickerDialogTime } from '../../examples/picker-dialog/picker-dialog-time';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Picker dialog page body. */
export async function PickerDialogBody() {
  const [date, time] = await Promise.all([
    readExampleSource('picker-dialog/picker-dialog-date.tsx'),
    readExampleSource('picker-dialog/picker-dialog-time.tsx'),
  ]);
  const [dateHtml, timeHtml] = await Promise.all([highlightSource(date), highlightSource(time)]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">PickerDialog</code> is the modal form of a date or time
          picker: it puts a <code className="text-on-surface">DatePicker</code>,{' '}
          <code className="text-on-surface">DateRangePicker</code> or{' '}
          <code className="text-on-surface">TimePicker</code> on a dialog surface with confirm and
          dismiss actions. Use it when a picker should interrupt the task; render the picker inline
          when it should sit in the layout.
        </p>
        <p className="text-body-large text-on-surface-variant">
          It is controlled with <code className="text-on-surface">open</code> /{' '}
          <code className="text-on-surface">onOpenChange</code> (or uncontrolled with{' '}
          <code className="text-on-surface">defaultOpen</code>). The common pattern is to edit a
          draft value and apply it in <code className="text-on-surface">confirmButton</code>, so
          cancelling leaves the committed value untouched.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Date dialog"
          code={date}
          html={dateHtml}
          fileName="picker-dialog-date.tsx"
        >
          <PickerDialogDate />
        </ExampleViewer>
        <ExampleViewer
          title="Time dialog with mode toggle"
          code={time}
          html={timeHtml}
          fileName="picker-dialog-time.tsx"
        >
          <PickerDialogTime />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            It is a React Aria modal dialog: focus is contained while open and restored to the
            trigger on close, and the types require an{' '}
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> (the time variant&apos;s{' '}
            <code className="text-on-surface">title</code> can also name it).
          </li>
          <li>
            Escape closes it, and a press outside closes it when{' '}
            <code className="text-on-surface">dismissable</code> (the default). The picker inside
            keeps its own keyboard model (calendar grid or dial).
          </li>
          <li>
            Actions read in order: the <code className="text-on-surface">modeToggleButton</code> at
            the start, then the <code className="text-on-surface">dismissButton</code> and{' '}
            <code className="text-on-surface">confirmButton</code> at the end.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            One component covers Compose&apos;s{' '}
            <code className="text-on-surface">DatePickerDialog</code> and{' '}
            <code className="text-on-surface">TimePickerDialog</code> through{' '}
            <code className="text-on-surface">variant</code>:{' '}
            <code className="text-on-surface">date</code> holds the picker edge to edge with the
            actions below; <code className="text-on-surface">time</code> pads the content 24px and
            shows a <code className="text-on-surface">label-medium</code> title.
          </li>
          <li>
            The panel is <code className="text-on-surface">surface-container-high</code> with 28px
            corners at elevation 3, on the dialog&apos;s scrim and motion. Date actions sit 8px
            apart with 8px below and 6px from the end; the time variant puts the mode toggle at the
            start of the actions row.
          </li>
          <li>
            <code className="text-on-surface">children</code> may be a function of{' '}
            <code className="text-on-surface">{'{ close }'}</code>, so a confirm action can apply
            its value and close in one place.
          </li>
        </ul>
      </section>
    </>
  );
}
