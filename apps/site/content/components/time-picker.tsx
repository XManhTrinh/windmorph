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
            Each number on the dial is a 48px button named &quot;7 hours of 12&quot; or &quot;35
            minutes of 60&quot; (<code className="text-on-surface">strings.dialValue</code>). Tab
            lands on the chosen one, arrow keys move around the dial, and Enter or Space chooses it;
            choosing an hour moves on to the minutes.
          </li>
          <li>
            The hour and minute selectors are text inputs: type the value, or focus one to pick
            which the dial edits; ↑ / ↓ step and wrap, and an out-of-range value is marked{' '}
            <code className="text-on-surface">aria-invalid</code>. AM / PM is a radio group.
          </li>
          <li>
            <code className="text-on-surface">TimePickerModeToggle</code> is the keyboard / clock
            button (&quot;Toggle input picker&quot; / &quot;Toggle dial picker&quot;) for the
            dialog&apos;s <code className="text-on-surface">modeToggleButton</code>.
          </li>
          <li>
            Pressing or dragging the dial picks the nearest hour (the inner ring when nearer the
            centre than halfway, on a 24-hour clock) or minute; releasing on the hour face switches
            to minutes.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            96 × 80px hour and minute selectors in{' '}
            <code className="text-on-surface">display-large</code> (114px wide on a 24-hour dial),
            selected <code className="text-on-surface">primary-container</code>, over a 256px{' '}
            <code className="text-on-surface">surface-container-highest</code> dial with a 48px{' '}
            <code className="text-on-surface">primary</code> handle. Input mode has 96 × 72px fields
            for both clocks.
          </li>
          <li>
            <code className="text-on-surface">layout=&quot;horizontal&quot;</code> puts the time
            beside the dial, with a 216 × 38px AM / PM selector below it. The default{' '}
            <code className="text-on-surface">auto</code> picks the vertical layout when the window
            is tall enough, the horizontal one when it is only wide enough, and the input when
            neither fits, so the picker never scrolls;{' '}
            <code className="text-on-surface">useTimePickerRoom()</code> returns that choice for
            your own layout.
          </li>
          <li>
            On a 24-hour dial, 00–11 are on the outer ring and 12–23 on the inner one, as in the
            spec&apos;s image, Compose and Android (one sentence of the spec says even and odd
            numbers instead).
          </li>
          <li>
            The AM / PM selector keeps the token&apos;s{' '}
            <code className="text-on-surface">tertiary-container</code> selected colour
            (Compose&apos;s{' '}
            <code className="text-on-surface">isUpdatedTimepickerToggleEnabled</code> flag would
            switch it to <code className="text-on-surface">primary-container</code>). The dial is an
            SVG, so nothing is positioned.
          </li>
        </ul>
      </section>
    </>
  );
}
