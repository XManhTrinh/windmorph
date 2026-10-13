import { ExampleViewer } from '../../components/example-viewer';
import { SnackbarHostDemo } from '../../examples/snackbar/snackbar-host';
import { SnackbarLayouts } from '../../examples/snackbar/snackbar-layouts';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Snackbar page body. */
export async function SnackbarBody() {
  const [layouts, host] = await Promise.all([
    readExampleSource('snackbar/snackbar-layouts.tsx'),
    readExampleSource('snackbar/snackbar-host.tsx'),
  ]);
  const [layoutsHtml, hostHtml] = await Promise.all([
    highlightSource(layouts),
    highlightSource(host),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A snackbar shows a brief message about an app process at the bottom of the screen, with an
          optional single action and dismiss button. Use it for low-priority, transient feedback
          that does not interrupt the task. Reach for a{' '}
          <code className="text-on-surface">Dialog</code> when the user must act before continuing,
          and a <code className="text-on-surface">Tooltip</code> for a label on hover or focus.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Most apps show snackbars through a <code className="text-on-surface">SnackbarHost</code>:
          create a state with <code className="text-on-surface">useSnackbarHostState()</code>, place
          one host, and call <code className="text-on-surface">showSnackbar</code>. The host queues
          messages and shows one at a time. Render a{' '}
          <code className="text-on-surface">Snackbar</code> directly only for custom placement.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Layouts"
          code={layouts}
          html={layoutsHtml}
          fileName="snackbar-layouts.tsx"
        >
          <SnackbarLayouts />
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The host is a persistent{' '}
            <code className="text-on-surface">aria-live=&quot;polite&quot;</code> region, so each
            new message is announced without moving focus. Snackbars never take focus themselves.
          </li>
          <li>
            <kbd className="text-on-surface">Alt+G</kbd> moves focus to a snackbar with an action or
            a dismiss button, as the spec asks for on the web. Change it with{' '}
            <code className="text-on-surface">focusShortcut</code> (or turn it off with{' '}
            <code className="text-on-surface">false</code>), and list it with your app&apos;s other
            shortcuts. The snackbar carries it in{' '}
            <code className="text-on-surface">aria-keyshortcuts</code>.
          </li>
          <li>
            Escape dismisses a snackbar while focus is inside it, with or without a dismiss (×)
            button. The dismiss button needs a name; it defaults to{' '}
            <code className="text-on-surface">dismissLabel</code> &quot;Dismiss&quot;.
          </li>
          <li>
            When a snackbar leaves with focus inside it, focus returns to where it was before it
            entered the snackbar.
          </li>
          <li>
            The auto-dismiss timer pauses while the pointer or focus is on the snackbar, so a reader
            or a slow pointer never loses the message (WCAG 2.2.1). Snackbars with an action never
            time out. On the web, use an auto-dismissing snackbar only alongside inline feedback for
            the same event.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">SnackbarHostState</code> ports Compose&apos;s queue:{' '}
            <code className="text-on-surface">showSnackbar</code> resolves{' '}
            <code className="text-on-surface">&apos;action-performed&apos;</code> or{' '}
            <code className="text-on-surface">&apos;dismissed&apos;</code>, so you can react to
            Undo.
          </li>
          <li>
            Durations match Compose: <code className="text-on-surface">short</code> 4s and{' '}
            <code className="text-on-surface">long</code> 10s. A snackbar with an action is always{' '}
            <code className="text-on-surface">indefinite</code>, as the spec requires; Compose lets
            you time one out. There is no platform accessibility multiplier.
          </li>
          <li>
            <code className="text-on-surface">showSnackbar(visuals, {'{ replace: true }'})</code>{' '}
            replaces the snackbar on screen with updated information instead of queueing behind it.
          </li>
          <li>
            The container is <code className="text-on-surface">inverse-surface</code> at elevation 3
            with 4px corners, up to 600px wide; the action is a text{' '}
            <code className="text-on-surface">Button</code> in{' '}
            <code className="text-on-surface">inverse-primary</code> and the dismiss is a standard{' '}
            <code className="text-on-surface">IconButton</code>.
          </li>
          <li>
            A leaving snackbar stays <code className="text-on-surface">inert</code> while the next
            one fades in, both sharing one grid cell, matching Compose&apos;s cross-fade. A snackbar
            expands upward from the bottom edge rather than scaling, since the spec avoids scale
            motion. The pause on hover or focus is an addition on top of Compose.
          </li>
        </ul>
      </section>
    </>
  );
}
