import { ExampleViewer } from '../../components/example-viewer';
import { ProgressCircular } from '../../examples/progress/progress-circular';
import { ProgressLinear } from '../../examples/progress/progress-linear';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Progress indicators page body. */
export async function ProgressBody() {
  const [linear, circular] = await Promise.all([
    readExampleSource('progress/progress-linear.tsx'),
    readExampleSource('progress/progress-circular.tsx'),
  ]);
  const [linearHtml, circularHtml] = await Promise.all([
    highlightSource(linear),
    highlightSource(circular),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Progress indicators show the status of an ongoing process. Use a determinate indicator (
          <code className="text-on-surface">value</code> 0–1) when you know how far along the work
          is, and an indeterminate one when you do not. Both come in a flat and an M3 Expressive{' '}
          <code className="text-on-surface">wavy</code> form.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">LinearProgressIndicator</code> is a horizontal track;{' '}
          <code className="text-on-surface">CircularProgressIndicator</code> is a ring. For an
          indeterminate circular indicator, reach for{' '}
          <code className="text-on-surface">LoadingIndicator</code> instead — M3 Expressive replaces
          the spinning circle with it.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Linear"
          code={linear}
          html={linearHtml}
          fileName="progress-linear.tsx"
        >
          <ProgressLinear />
        </ExampleViewer>
        <ExampleViewer
          title="Circular"
          code={circular}
          html={circularHtml}
          fileName="progress-circular.tsx"
        >
          <ProgressCircular />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Both are React Aria progress bars (
            <code className="text-on-surface">role=&quot;progressbar&quot;</code>), so the types
            require an <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>. They are not focusable and
            have no keyboard interaction — they report, they do not accept input.
          </li>
          <li>
            A determinate indicator exposes its value; an indeterminate one announces that work is
            in progress. The animated SVG is <code className="text-on-surface">aria-hidden</code>.
          </li>
          <li>
            Under <code className="text-on-surface">prefers-reduced-motion</code> the wave stops
            travelling and amplitude changes snap; indeterminate motion stays, because it conveys
            activity.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            There is{' '}
            <strong className="text-on-surface">no indeterminate circular indicator</strong>: it is
            deprecated in M3 Expressive, so{' '}
            <code className="text-on-surface">CircularProgressIndicator</code> requires{' '}
            <code className="text-on-surface">value</code>, and{' '}
            <code className="text-on-surface">LoadingIndicator</code> covers the indeterminate case.
          </li>
          <li>
            Shared values: a <code className="text-on-surface">primary</code> active indicator and
            stop dot on a <code className="text-on-surface">secondary-container</code> track, with
            4px round strokes and a 4px gap. Linear is 240px wide (4px tall, 10px wavy); circular is
            40px (48px wavy).
          </li>
          <li>
            Linear draws Compose&apos;s wavy quadratics and keyframed indeterminate curves; a wavy
            determinate indicator flattens below 10% and above 95%. The{' '}
            <code className="text-on-surface">stopIndicator</code> dot (on by default) shrinks once
            progress reaches it.
          </li>
          <li>
            Geometry and timing are pure functions tested against Compose&apos;s numbers; the first
            render is a deterministic t = 0 frame (SSR-safe), and the SVG mirrors in RTL.
          </li>
        </ul>
      </section>
    </>
  );
}
