import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { PickerDialogDate } from '../../examples/picker-dialog/picker-dialog-date';
import { PickerDialogTime } from '../../examples/picker-dialog/picker-dialog-time';
import { PickerDialogFullScreen } from '../../examples/picker-dialog/picker-dialog-full-screen';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Picker dialog page body. */
export async function PickerDialogBody(): Promise<ComponentDoc> {
  const [date, time, fullScreen] = await Promise.all([
    readExampleSource('picker-dialog/picker-dialog-date.tsx'),
    readExampleSource('picker-dialog/picker-dialog-time.tsx'),
    readExampleSource('picker-dialog/picker-dialog-full-screen.tsx'),
  ]);
  const [dateHtml, timeHtml, fullScreenHtml] = await Promise.all([
    highlightSource(date),
    highlightSource(time),
    highlightSource(fullScreen),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Full screen"
            code={fullScreen}
            html={fullScreenHtml}
            fileName="picker-dialog-full-screen.tsx"
          >
            <PickerDialogFullScreen />
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
            <InlineCode>PickerDialog</InlineCode> is the modal form of a date or time picker: it
            puts a <InlineCode>DatePicker</InlineCode>, <InlineCode>DateRangePicker</InlineCode> or{' '}
            <InlineCode>TimePicker</InlineCode> on a dialog surface with confirm and dismiss
            actions. Use it when a picker should interrupt the task; render the picker inline when
            it should sit in the layout.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It is controlled with <InlineCode>open</InlineCode> /{' '}
            <InlineCode>onOpenChange</InlineCode> (or uncontrolled with{' '}
            <InlineCode>defaultOpen</InlineCode>). The common pattern is to edit a draft value and
            apply it in <InlineCode>onConfirm</InlineCode> (and the{' '}
            <InlineCode>confirmButton</InlineCode>), so cancelling leaves the committed value
            untouched.
          </p>
          <p className="text-body-large text-on-surface-variant">
            On compact windows M3 recommends a full-screen date picker:{' '}
            <InlineCode>fullScreen=&quot;compact&quot;</InlineCode> (below 600px) or{' '}
            <InlineCode>&quot;always&quot;</InlineCode> fills the window and puts a close (x) button
            and a Save button, which calls <InlineCode>onConfirm</InlineCode>, at the top instead of
            the actions.
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
              It is a React Aria modal dialog: focus is contained while open and restored to the
              trigger on close, and the types require an <InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode> (the time variant&apos;s{' '}
              <InlineCode>title</InlineCode> can also name it).
            </li>
            <li>
              Escape closes it, and a press outside closes it when{' '}
              <InlineCode>dismissable</InlineCode> (the default). The picker inside keeps its own
              keyboard model (calendar grid or dial). With <InlineCode>onConfirm</InlineCode>, Enter
              on a day (or in a typed date) closes the dialog and saves, as the M3 date picker
              keyboard table asks; <InlineCode>onConfirm</InlineCode> runs once the picker&apos;s
              new value has rendered.
            </li>
            <li>
              Actions read in order: the <InlineCode>modeToggleButton</InlineCode> at the start,
              then the <InlineCode>dismissButton</InlineCode> and{' '}
              <InlineCode>confirmButton</InlineCode> at the end.
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
              One component covers Compose&apos;s <InlineCode>DatePickerDialog</InlineCode> and{' '}
              <InlineCode>TimePickerDialog</InlineCode> through <InlineCode>variant</InlineCode>:{' '}
              <InlineCode>date</InlineCode> holds the picker edge to edge with the actions below;{' '}
              <InlineCode>time</InlineCode> pads the content 24px and shows a{' '}
              <InlineCode>label-medium</InlineCode> title.
            </li>
            <li>
              The panel is <InlineCode>surface-container-high</InlineCode> with 28px corners at
              elevation 3, on the dialog&apos;s scrim and motion. Date actions sit 8px apart with
              8px below and 6px from the end; the time variant puts the mode toggle at the start of
              the actions row.
            </li>
            <li>
              Full screen follows the M3 full-screen dialog, as <InlineCode>Dialog</InlineCode>{' '}
              does: the panel fills the window on <InlineCode>surface</InlineCode> with no corners
              or elevation, under a 64px row holding the close button and Save; the range
              picker&apos;s month list fills the height.
            </li>
            <li>
              <InlineCode>children</InlineCode> may be a function of{' '}
              <InlineCode>{'{ close }'}</InlineCode>, so a confirm action can apply its value and
              close in one place.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
