import { progressIndicatorTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ProgressCircular = lazyExample('progress/progress-circular', 'ProgressCircular');
const ProgressLinear = lazyExample('progress/progress-linear', 'ProgressLinear');
const ProgressSizes = lazyExample('progress/progress-sizes', 'ProgressSizes');
const ProgressTrack = lazyExample('progress/progress-track', 'ProgressTrack');

/** Progress indicators page body. */
export async function ProgressBody(): Promise<ComponentDoc> {
  const [linear, circular, sizes, progressTrack] = await Promise.all([
    readExampleSource('progress/progress-linear.tsx'),
    readExampleSource('progress/progress-circular.tsx'),
    readExampleSource('progress/progress-sizes.tsx'),
    readExampleSource('progress/progress-track.tsx'),
  ]);
  const [linearHtml, circularHtml, sizesHtml, progressTrackHtml] = await Promise.all([
    highlightSource(linear),
    highlightSource(circular),
    highlightSource(sizes),
    highlightSource(progressTrack),
  ]);

  return {
    tokens: [progressIndicatorTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Circular sizes"
            code={sizes}
            html={sizesHtml}
            fileName="progress-sizes.tsx"
          >
            <ProgressSizes />
          </ExampleViewer>
          <ExampleViewer
            title="Track, stop dot and in a button"
            code={progressTrack}
            html={progressTrackHtml}
            fileName="progress-track.tsx"
          >
            <ProgressTrack />
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
            Progress indicators show the status of an ongoing process. Use a determinate indicator (
            <InlineCode>value</InlineCode> 0–1) when you know how far along the work is, and an
            indeterminate one when you do not. Both come in a flat and an M3 Expressive{' '}
            <InlineCode>wavy</InlineCode> form.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>LinearProgressIndicator</InlineCode> is a horizontal track;{' '}
            <InlineCode>CircularProgressIndicator</InlineCode> is a ring. For short indeterminate
            waits (under 5 seconds) the <InlineCode>LoadingIndicator</InlineCode> is recommended.
            When a process&apos;s progress becomes known, give an indeterminate indicator its{' '}
            <InlineCode>value</InlineCode>: the moving line eases into it.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>thickness</InlineCode> and <InlineCode>trackThickness</InlineCode> set the
            strokes (4px by default); 8px is the spec&apos;s thick configuration, and the indicator
            grows to fit. Inside a button, remove the track with{' '}
            <InlineCode>track={'{false}'}</InlineCode> and colour the indicator like the label with{' '}
            <InlineCode>classNames.indicator</InlineCode> set to{' '}
            <InlineCode>stroke-current</InlineCode>.
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
              Both are React Aria progress bars (
              <InlineCode>role=&quot;progressbar&quot;</InlineCode>
              ), so the types require an <InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode>. They are not focusable and have no keyboard
              interaction — they report, they do not accept input.
            </li>
            <li>
              A determinate indicator exposes its value; an indeterminate one announces that work is
              in progress. The animated SVG is <InlineCode>aria-hidden</InlineCode>.
            </li>
            <li>
              Under <InlineCode>prefers-reduced-motion</InlineCode> the wave stops travelling, and
              amplitude and value changes snap; indeterminate motion stays, because it conveys
              activity.
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
              The indeterminate circular indicator follows Compose&apos;s 6-second cycle (a 1080°
              turn plus a 90° step every 1.5s, the arc growing from 10% to 87% and back) and keeps
              its track, which the spec shows (Compose&apos;s flat one hides it).
            </li>
            <li>
              Shared values: a <InlineCode>primary</InlineCode> active indicator and stop dot on a{' '}
              <InlineCode>secondary-container</InlineCode> track, with 4px round strokes and a 4px
              gap. Linear is 240px wide (4px tall, 10px wavy); circular is 40px (48px wavy). Thicker
              strokes grow the box by the extra thickness (Compose&apos;s thick samples: 14px
              linear, 52px wavy circular at 8px).
            </li>
            <li>
              Linear draws Compose&apos;s wavy quadratics and keyframed indeterminate curves; a wavy
              determinate indicator flattens below 10% and above 95%. The{' '}
              <InlineCode>stopIndicator</InlineCode> dot (on by default) shrinks once progress
              reaches it.
            </li>
            <li>
              Geometry and timing are pure functions tested against Compose&apos;s numbers; the
              first render is a deterministic t = 0 frame (SSR-safe). The linear indicator mirrors
              in RTL; the circular one stays clockwise, as the spec says.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
