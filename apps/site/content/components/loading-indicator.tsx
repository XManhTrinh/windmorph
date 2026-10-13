import { ExampleViewer } from '../../components/example-viewer';
import { LoadingDeterminate } from '../../examples/loading-indicator/loading-determinate';
import { LoadingIndeterminate } from '../../examples/loading-indicator/loading-indeterminate';
import { LoadingShapes } from '../../examples/loading-indicator/loading-shapes';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Loading indicator page body. */
export async function LoadingIndicatorBody() {
  const [indeterminate, determinate, shapes] = await Promise.all([
    readExampleSource('loading-indicator/loading-indeterminate.tsx'),
    readExampleSource('loading-indicator/loading-determinate.tsx'),
    readExampleSource('loading-indicator/loading-shapes.tsx'),
  ]);
  const [indeterminateHtml, determinateHtml, shapesHtml] = await Promise.all([
    highlightSource(indeterminate),
    highlightSource(determinate),
    highlightSource(shapes),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The M3 Expressive loading indicator is a shape that morphs through Material shapes while
          it rotates. Use it for short, indeterminate waits — it replaces the spinning circular
          progress indicator. Pass <code className="text-on-surface">value</code> (0–1) for a
          determinate variant that morphs from a circle to a soft burst as it fills.
        </p>
        <p className="text-body-large text-on-surface-variant">
          For a horizontal track, or a determinate ring with a stop dot, use{' '}
          <code className="text-on-surface">LinearProgressIndicator</code> or{' '}
          <code className="text-on-surface">CircularProgressIndicator</code> instead.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Indeterminate"
          code={indeterminate}
          html={indeterminateHtml}
          fileName="loading-indeterminate.tsx"
        >
          <LoadingIndeterminate />
        </ExampleViewer>
        <ExampleViewer
          title="Determinate and sizing"
          code={determinate}
          html={determinateHtml}
          fileName="loading-determinate.tsx"
        >
          <LoadingDeterminate />
        </ExampleViewer>
        <ExampleViewer
          title="Custom shapes"
          code={shapes}
          html={shapesHtml}
          fileName="loading-shapes.tsx"
        >
          <LoadingShapes />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            It is a React Aria <code className="text-on-surface">useProgressBar</code> (
            <code className="text-on-surface">role=&quot;progressbar&quot;</code>), so the types
            require an <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>. A determinate indicator
            exposes <code className="text-on-surface">aria-valuenow</code> /{' '}
            <code className="text-on-surface">aria-valuetext</code>.
          </li>
          <li>It is not focusable and has no keyboard interaction; the drawing is decorative.</li>
          <li>
            Under <code className="text-on-surface">prefers-reduced-motion</code> the indeterminate
            indicator only rotates, with no morphs or springy quarter turns.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A single 48px box with full corners and no <code className="text-on-surface">size</code>{' '}
            prop — there is one spec size. <code className="text-on-surface">className</code> (e.g.{' '}
            <code className="text-on-surface">size-24</code>) resizes the box and the shape scales
            with it, kept square and centred by the viewBox.
          </li>
          <li>
            <code className="text-on-surface">variant</code> is{' '}
            <code className="text-on-surface">default</code> (a{' '}
            <code className="text-on-surface">primary</code> indicator) or{' '}
            <code className="text-on-surface">contained</code> (
            <code className="text-on-surface">on-primary-container</code> on a{' '}
            <code className="text-on-surface">primary-container</code> circle).
          </li>
          <li>
            Indeterminate loops Compose&apos;s seven shapes, springing to the next every 650ms with
            a quarter-turn of rotation; determinate morphs a circle into a soft burst as{' '}
            <code className="text-on-surface">value</code> rises.{' '}
            <code className="text-on-surface">shapes</code> overrides the sequence with two or more{' '}
            <code className="text-on-surface">MaterialShapes</code> names or{' '}
            <code className="text-on-surface">RoundedPolygon</code>s.
          </li>
          <li>
            Every frame is a pure function of elapsed time (tested against Compose&apos;s numbers);
            Motion writes the path and the inner <code className="text-on-surface">&lt;g&gt;</code>{' '}
            rotation straight to the SVG, so animation causes no React renders.
          </li>
        </ul>
      </section>
    </>
  );
}
