import { timePickerTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const TimePickerDial = lazyExample('time-picker/time-picker-dial', 'TimePickerDial');
const TimePickerModes = lazyExample('time-picker/time-picker-modes', 'TimePickerModes');
const TimePickerModal = lazyExample('time-picker/time-picker-modal', 'TimePickerModal');

/** Time picker page body. */
export async function TimePickerBody(): Promise<ComponentDoc> {
  const [dial, modes, timePickerModal] = await Promise.all([
    readExampleSource('time-picker/time-picker-dial.tsx'),
    readExampleSource('time-picker/time-picker-modes.tsx'),
    readExampleSource('time-picker/time-picker-modal.tsx'),
  ]);
  const [dialHtml, modesHtml, timePickerModalHtml] = await Promise.all([
    highlightSource(dial),
    highlightSource(modes),
    highlightSource(timePickerModal),
  ]);

  return {
    tokens: [timePickerTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="In a dialog"
            code={timePickerModal}
            html={timePickerModalHtml}
            fileName="time-picker-modal.tsx"
          >
            <TimePickerModal />
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
            The time picker lets someone choose an hour and minute on a clock dial or by typing in
            input mode, with an AM / PM selector on a 12-hour clock. It renders just the picker
            content; wrap it in a <InlineCode>PickerDialog</InlineCode> for the modal form.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Its value is an <InlineCode>@internationalized/date</InlineCode>{' '}
            <InlineCode>Time</InlineCode>, controlled (<InlineCode>value</InlineCode> /{' '}
            <InlineCode>onChange</InlineCode>) or uncontrolled (
            <InlineCode>defaultValue</InlineCode>
            ). The hour cycle defaults to the locale&apos;s; set <InlineCode>
              hourCycle
            </InlineCode>{' '}
            to <InlineCode>12</InlineCode> or <InlineCode>24</InlineCode> to force one.
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
              Each number on the dial is a 48px button named &quot;7 hours of 12&quot; or &quot;35
              minutes of 60&quot; (<InlineCode>strings.dialValue</InlineCode>). Tab lands on the
              chosen one, arrow keys move around the dial, and Enter or Space chooses it; choosing
              an hour moves on to the minutes.
            </li>
            <li>
              The hour and minute selectors are text inputs: type the value, or focus one to pick
              which the dial edits; ↑ / ↓ step and wrap, and an out-of-range value is marked{' '}
              <InlineCode>aria-invalid</InlineCode>. In input mode a complete hour moves on to the
              minute. AM / PM is a radio group: one Tab stop, with the arrow keys moving the choice.
              The time reads left to right in right-to-left layouts too.
            </li>
            <li>
              <InlineCode>TimePickerModeToggle</InlineCode> is the keyboard / clock button
              (&quot;Toggle input picker&quot; / &quot;Toggle dial picker&quot;) for the
              dialog&apos;s <InlineCode>modeToggleButton</InlineCode>.
            </li>
            <li>
              Pressing or dragging the dial picks the nearest hour (the inner ring within 74px of
              the centre, on a 24-hour clock) or five minutes; releasing on the hour face switches
              to minutes. The hand turns there on a spring, the short way round (it jumps under
              reduced motion).
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
              96 × 80px hour and minute selectors in <InlineCode>display-large</InlineCode> (114px
              wide on a 24-hour dial), selected <InlineCode>primary-container</InlineCode>, over a
              256px <InlineCode>surface-container-highest</InlineCode> dial with a 48px{' '}
              <InlineCode>primary</InlineCode> handle. Input mode has 96 × 72px fields for both
              clocks.
            </li>
            <li>
              <InlineCode>layout=&quot;horizontal&quot;</InlineCode> puts the time beside the dial,
              with a 216 × 38px AM / PM selector below it. The default <InlineCode>auto</InlineCode>{' '}
              picks the vertical layout when the window is tall enough, the horizontal one when it
              is only wide enough, and the input when neither fits, so the picker never scrolls;{' '}
              <InlineCode>useTimePickerRoom()</InlineCode> returns that choice for your own layout.
            </li>
            <li>
              On a 24-hour dial, 00–11 are on the outer ring and 12–23 on the inner one, as in the
              spec&apos;s image, Compose and Android (one sentence of the spec says even and odd
              numbers instead).
            </li>
            <li>
              The AM / PM selector keeps the token&apos;s{' '}
              <InlineCode>tertiary-container</InlineCode> selected colour (Compose&apos;s{' '}
              <InlineCode>isUpdatedTimepickerToggleEnabled</InlineCode> flag would switch it to{' '}
              <InlineCode>primary-container</InlineCode>). The dial is an SVG, so nothing is
              positioned.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
