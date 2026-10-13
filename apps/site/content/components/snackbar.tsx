import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { SnackbarHostDemo } from '../../examples/snackbar/snackbar-host';
import { SnackbarLayouts } from '../../examples/snackbar/snackbar-layouts';
import { SnackbarTwoLines } from '../../examples/snackbar/snackbar-two-lines';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Snackbar page body. */
export async function SnackbarBody(): Promise<ComponentDoc> {
  const [layouts, host, snackbarTwoLines] = await Promise.all([
    readExampleSource('snackbar/snackbar-layouts.tsx'),
    readExampleSource('snackbar/snackbar-host.tsx'),
    readExampleSource('snackbar/snackbar-two-lines.tsx'),
  ]);
  const [layoutsHtml, hostHtml, snackbarTwoLinesHtml] = await Promise.all([
    highlightSource(layouts),
    highlightSource(host),
    highlightSource(snackbarTwoLines),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Layouts"
            code={layouts}
            html={layoutsHtml}
            fileName="snackbar-layouts.tsx"
          >
            <SnackbarLayouts />
          </ExampleViewer>
          <ExampleViewer
            title="Two lines"
            code={snackbarTwoLines}
            html={snackbarTwoLinesHtml}
            fileName="snackbar-two-lines.tsx"
          >
            <SnackbarTwoLines />
          </ExampleViewer>
          <ExampleViewer
            title="Host and queue"
            code={host}
            html={hostHtml}
            fileName="snackbar-host.tsx"
            tabbed
          >
            <SnackbarHostDemo />
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
            A snackbar shows a brief message about an app process at the bottom of the screen, with
            an optional single action and dismiss button. Use it for low-priority, transient
            feedback that does not interrupt the task. Reach for a <InlineCode>Dialog</InlineCode>{' '}
            when the user must act before continuing, and a <InlineCode>Tooltip</InlineCode> for a
            label on hover or focus.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Most apps show snackbars through a <InlineCode>SnackbarHost</InlineCode>: create a state
            with <InlineCode>useSnackbarHostState()</InlineCode>, place one host, and call{' '}
            <InlineCode>showSnackbar</InlineCode>. The host queues messages and shows one at a time.
            Render a <InlineCode>Snackbar</InlineCode> directly only for custom placement.
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
              The host is a persistent <InlineCode>aria-live=&quot;polite&quot;</InlineCode> region,
              so each new message is announced without moving focus. The region goes on the page
              empty and snackbars follow, so one shown at launch is announced too. Snackbars never
              take focus themselves.
            </li>
            <li>
              A <InlineCode>Snackbar</InlineCode> rendered without a host announces its message
              politely itself, when it appears and when the message changes. Don&apos;t also put it
              in a live region of your own.
            </li>
            <li>
              <kbd className="text-on-surface">Alt+G</kbd> moves focus to a snackbar with an action
              or a dismiss button, as the spec asks for on the web. Change it with{' '}
              <InlineCode>focusShortcut</InlineCode> (or turn it off with{' '}
              <InlineCode>false</InlineCode>), and list it with your app&apos;s other shortcuts. The
              snackbar carries it in <InlineCode>aria-keyshortcuts</InlineCode>.
            </li>
            <li>
              Escape dismisses a snackbar while focus is inside it, with or without a dismiss (×)
              button. The dismiss button needs a name; it defaults to{' '}
              <InlineCode>dismissLabel</InlineCode> &quot;Dismiss&quot;.
            </li>
            <li>
              When a snackbar leaves with focus inside it, focus returns to where it was before it
              entered the snackbar.
            </li>
            <li>
              The auto-dismiss timer pauses while the pointer or focus is on the snackbar, so a
              reader or a slow pointer never loses the message (WCAG 2.2.1). Snackbars with an
              action never time out. On the web, use an auto-dismissing snackbar only alongside
              inline feedback for the same event.
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
              <InlineCode>SnackbarHostState</InlineCode> ports Compose&apos;s queue:{' '}
              <InlineCode>showSnackbar</InlineCode> resolves{' '}
              <InlineCode>&apos;action-performed&apos;</InlineCode> or{' '}
              <InlineCode>&apos;dismissed&apos;</InlineCode>, so you can react to Undo.
            </li>
            <li>
              Durations match Compose: <InlineCode>short</InlineCode> 4s and{' '}
              <InlineCode>long</InlineCode> 10s. A snackbar with an action is always{' '}
              <InlineCode>indefinite</InlineCode>, as the spec requires; Compose lets you time one
              out. There is no platform accessibility multiplier.
            </li>
            <li>
              <InlineCode>showSnackbar(visuals, {'{ replace: true }'})</InlineCode> replaces the
              snackbar on screen with updated information instead of queueing behind it.
            </li>
            <li>
              The container is <InlineCode>inverse-surface</InlineCode> at elevation 3 with 4px
              corners, up to 600px wide; the action is a text <InlineCode>Button</InlineCode> in{' '}
              <InlineCode>inverse-primary</InlineCode> and the dismiss is a standard{' '}
              <InlineCode>IconButton</InlineCode>.
            </li>
            <li>
              A leaving snackbar stays <InlineCode>inert</InlineCode> while the next one fades in,
              both sharing one grid cell, matching Compose&apos;s cross-fade. A snackbar expands
              upward from the bottom edge rather than scaling, since the spec avoids scale motion.
              The pause on hover or focus is an addition on top of Compose.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
