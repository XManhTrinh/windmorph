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
          <code className="text-on-surface">CircularProgressIndicator</code> is a ring. For short
          indeterminate waits (under 5 seconds) the{' '}
          <code className="text-on-surface">LoadingIndicator</code> is recommended. When a
          process&apos;s progress becomes known, give an indeterminate indicator its{' '}
          <code className="text-on-surface">value</code>: the moving line eases into it.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">thickness</code> and{' '}
          <code className="text-on-surface">trackThickness</code> set the strokes (4px by default);
          8px is the spec&apos;s thick configuration, and the indicator grows to fit. Inside a
          button, remove the track with <code className="text-on-surface">track={'{false}'}</code>{' '}
          and colour the indicator like the label with{' '}
          <code className="text-on-surface">classNames.indicator</code> set to{' '}
          <code className="text-on-surface">stroke-current</code>.
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
            The indeterminate circular indicator follows Compose&apos;s 6-second cycle (a 1080° turn
            plus a 90° step every 1.5s, the arc growing from 10% to 87% and back) and keeps its
            track, which the spec shows (Compose&apos;s flat one hides it).
          </li>
          <li>
            Shared values: a <code className="text-on-surface">primary</code> active indicator and
            stop dot on a <code className="text-on-surface">secondary-container</code> track, with
            4px round strokes and a 4px gap. Linear is 240px wide (4px tall, 10px wavy); circular is
            40px (48px wavy). Thicker strokes grow the box by the extra thickness (Compose&apos;s
            thick samples: 14px linear, 52px wavy circular at 8px).
          </li>
          <li>
            Linear draws Compose&apos;s wavy quadratics and keyframed indeterminate curves; a wavy
            determinate indicator flattens below 10% and above 95%. The{' '}
            <code className="text-on-surface">stopIndicator</code> dot (on by default) shrinks once
            progress reaches it.
          </li>
          <li>
            Geometry and timing are pure functions tested against Compose&apos;s numbers; the first
            render is a deterministic t = 0 frame (SSR-safe). The linear indicator mirrors in RTL;
            the circular one stays clockwise, as the spec says.
          </li>
        </ul>
      </section>
    </>
  );
}
