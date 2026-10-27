import { snackbarTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SnackbarHostDemo = lazyExample('snackbar/snackbar-host', 'SnackbarHostDemo');
const SnackbarLayouts = lazyExample('snackbar/snackbar-layouts', 'SnackbarLayouts');
const SnackbarTwoLines = lazyExample('snackbar/snackbar-two-lines', 'SnackbarTwoLines');

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
    tokens: [snackbarTokenSet],
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
          <p className="text-body-large text-on-surface-variant">
            Snackbars appear above FABs, never in front of or behind them, and never over a
            navigation bar. Lift the host above what sits at the bottom of the screen: with a 56px
            FAB at <InlineCode>bottom-4</InlineCode>, place it at{' '}
            <InlineCode>fixed inset-x-0 bottom-[72px]</InlineCode> (the FAB&apos;s 16px margin and
            its height; the host&apos;s own 12px padding is the gap), and above a navigation bar add
            the bar&apos;s height. Move the host back down when the FAB hides.
          </p>
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
