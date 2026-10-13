import { ExampleViewer } from '../../components/example-viewer';
import { SliderDiscrete } from '../../examples/slider/slider-discrete';
import { SliderRange } from '../../examples/slider/slider-range';
import { SliderSizes } from '../../examples/slider/slider-sizes';
import { SliderValueLabel } from '../../examples/slider/slider-value-label';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Slider + RangeSlider page body. */
export async function SliderBody() {
  const [sizes, valueLabel, discrete, range] = await Promise.all([
    readExampleSource('slider/slider-sizes.tsx'),
    readExampleSource('slider/slider-value-label.tsx'),
    readExampleSource('slider/slider-discrete.tsx'),
    readExampleSource('slider/slider-range.tsx'),
  ]);
  const [sizesHtml, valueLabelHtml, discreteHtml, rangeHtml] = await Promise.all([
    highlightSource(sizes),
    highlightSource(valueLabel),
    highlightSource(discrete),
    highlightSource(range),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Sliders let people choose a value, or a range with{' '}
          <code className="text-on-surface">RangeSlider</code>, from a continuous or stepped scale —
          volume, brightness, a price band. Reach for a{' '}
          <code className="text-on-surface">TextField</code> when an exact number matters more than
          quick adjustment.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A name is required: pass an <code className="text-on-surface">aria-label</code> or{' '}
          <code className="text-on-surface">aria-labelledby</code>. The value is controlled through{' '}
          <code className="text-on-surface">value</code> /{' '}
          <code className="text-on-surface">onChange</code> (and{' '}
          <code className="text-on-surface">onChangeEnd</code>) or uncontrolled with{' '}
          <code className="text-on-surface">defaultValue</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer title="Sizes" code={sizes} html={sizesHtml} fileName="slider-sizes.tsx">
          <SliderSizes />
        </ExampleViewer>
        <ExampleViewer
          title="Value label and inset icon"
          code={valueLabel}
          html={valueLabelHtml}
          fileName="slider-value-label.tsx"
        >
          <SliderValueLabel />
        </ExampleViewer>
        <ExampleViewer
          title="Discrete and centered"
          code={discrete}
          html={discreteHtml}
          fileName="slider-discrete.tsx"
        >
          <SliderDiscrete />
        </ExampleViewer>
        <ExampleViewer title="Range" code={range} html={rangeHtml} fileName="slider-range.tsx">
          <SliderRange />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Built on React Aria <code className="text-on-surface">useSlider</code> /{' '}
            <code className="text-on-surface">useSliderThumb</code> with a hidden range input per
            thumb, so each thumb is a focusable slider for assistive tech.
          </li>
          <li>
            With a thumb focused: the arrow keys nudge by{' '}
            <code className="text-on-surface">step</code>, Page Up / Page Down jump by a larger
            amount, and Home / End go to the minimum / maximum. The directions mirror in RTL.
          </li>
          <li>
            A name is required (<code className="text-on-surface">aria-label</code> /{' '}
            <code className="text-on-surface">aria-labelledby</code>); a range slider also names
            each thumb via <code className="text-on-surface">thumbLabels</code>.
          </li>
          <li>
            <code className="text-on-surface">formatOptions</code> formats the announced value;{' '}
            <code className="text-on-surface">showValueLabel</code> adds a visible value pill while
            dragging or keyboard-focused.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Compose ships one size (16px track, 44px handle); the Expressive sizes{' '}
            <code className="text-on-surface">xs–xl</code> come from the M3 token values in Material
            Components Android — tracks 16 / 24 / 40 / 56 / 96px, handles 44 / 44 / 44 / 68 / 108px.
          </li>
          <li>
            Active track and handle are <code className="text-on-surface">primary</code>, the
            inactive track <code className="text-on-surface">secondary-container</code>; the 4px
            handle narrows to 2px while pressed, dragged or focused, with a gap each side.
          </li>
          <li>
            The track geometry ports Compose&apos;s{' '}
            <code className="text-on-surface">drawTrack</code> as CSS length expressions, so the
            first server render is exact and resizing needs no measuring; range and centred tracks
            carry stop indicators at both ends.
          </li>
          <li>
            Inset icons follow MDC — a <code className="text-on-surface">startIcon</code> 10px
            inside the active track&apos;s start and an{' '}
            <code className="text-on-surface">endIcon</code> 10px inside the inactive end (replacing
            the stop) on sizes md and up; the value indicator pill is not in Compose&apos;s default
            slider.
          </li>
          <li>
            <strong>Deviation:</strong> pressing the track maps linearly to the value while discrete
            thumbs are drawn between the corners, so a press near the ends of a discrete track can
            land one step off Compose; there are no haptics.
          </li>
        </ul>
      </section>
    </>
  );
}
