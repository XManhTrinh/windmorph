import { ExampleViewer } from '../../components/example-viewer';
import { TimePickerDial } from '../../examples/time-picker/time-picker-dial';
import { TimePickerModes } from '../../examples/time-picker/time-picker-modes';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Time picker page body. */
export async function TimePickerBody() {
  const [dial, modes] = await Promise.all([
    readExampleSource('time-picker/time-picker-dial.tsx'),
    readExampleSource('time-picker/time-picker-modes.tsx'),
  ]);
  const [dialHtml, modesHtml] = await Promise.all([highlightSource(dial), highlightSource(modes)]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The time picker lets someone choose an hour and minute on a clock dial or by typing in
          input mode, with an AM / PM selector on a 12-hour clock. It renders just the picker
          content; wrap it in a <code className="text-on-surface">PickerDialog</code> for the modal
          form.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Its value is an <code className="text-on-surface">@internationalized/date</code>{' '}
          <code className="text-on-surface">Time</code>, controlled (
          <code className="text-on-surface">value</code> /{' '}
          <code className="text-on-surface">onChange</code>) or uncontrolled (
          <code className="text-on-surface">defaultValue</code>). The hour cycle defaults to the
          locale&apos;s; set <code className="text-on-surface">hourCycle</code> to{' '}
          <code className="text-on-surface">12</code> or <code className="text-on-surface">24</code>{' '}
          to force one.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Dial (12-hour)"
          code={dial}
          html={dialHtml}
          fileName="time-picker-dial.tsx"
          tabbed
        >
          <TimePickerDial />
        </ExampleViewer>
        <ExampleViewer
          title="24-hour and input mode"
          code={modes}
          html={modesHtml}
          fileName="time-picker-modes.tsx"
          tabbed
        >
          <TimePickerModes />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The dial is an SVG <code className="text-on-surface">role=&quot;slider&quot;</code> with{' '}
            <code className="text-on-surface">aria-valuetext</code>; arrow keys step by one hour or
            minute. The hour and minute selectors are toggle buttons that switch which the dial
            edits, and AM / PM is a radio group.
          </li>
          <li>
            Input mode&apos;s hour and minute fields are labelled numeric inputs; ↑ / ↓ step and
            wrap, and an out-of-range value is marked{' '}
            <code className="text-on-surface">aria-invalid</code>.
          </li>
          <li>
            Pressing or dragging the dial picks the nearest hour (the inner ring when nearer the
            centre than halfway, on a 24-hour clock) or minute; releasing on the hour face switches
            to minutes. It follows the DOM direction via{' '}
            <code className="text-on-surface">DomDirectionLocale</code>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            96 × 80px hour and minute selectors in{' '}
            <code className="text-on-surface">display-large</code> (114px wide for 24 hours),
            selected <code className="text-on-surface">primary-container</code>, over a 256px{' '}
            <code className="text-on-surface">surface-container-highest</code> dial with a 48px{' '}
            <code className="text-on-surface">primary</code> handle.
          </li>
          <li>
            The AM / PM selector keeps the token&apos;s{' '}
            <code className="text-on-surface">tertiary-container</code> selected colour
            (Compose&apos;s{' '}
            <code className="text-on-surface">isUpdatedTimepickerToggleEnabled</code> flag would
            switch it to <code className="text-on-surface">primary-container</code>), as with the
            checkbox flag.
          </li>
          <li>
            The dial is an SVG so nothing is positioned, keeping it layout-safe. Input-mode field
            sizes are provisional (not from token files): 96 × 72px in{' '}
            <code className="text-on-surface">display-medium</code> with{' '}
            <code className="text-on-surface">body-small</code> labels below.
          </li>
        </ul>
      </section>
    </>
  );
}
