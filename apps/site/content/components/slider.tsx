import { ExampleViewer } from '../../components/example-viewer';
import { SliderDiscrete } from '../../examples/slider/slider-discrete';
import { SliderRange } from '../../examples/slider/slider-range';
import { SliderSizes } from '../../examples/slider/slider-sizes';
import { SliderValueLabel } from '../../examples/slider/slider-value-label';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

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
          Sliders let people choose a value, or a range with <InlineCode>RangeSlider</InlineCode>,
          from a continuous or stepped scale — volume, brightness, a price band. Reach for a{' '}
          <InlineCode>TextField</InlineCode> when an exact number matters more than quick
          adjustment.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A name is required: pass an <InlineCode>aria-label</InlineCode> or{' '}
          <InlineCode>aria-labelledby</InlineCode>. The value is controlled through{' '}
          <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode> (and{' '}
          <InlineCode>onChangeEnd</InlineCode>) or uncontrolled with{' '}
          <InlineCode>defaultValue</InlineCode>.
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
            Built on React Aria <InlineCode>useSlider</InlineCode> /{' '}
            <InlineCode>useSliderThumb</InlineCode> with a hidden range input per thumb, so each
            thumb is a focusable slider for assistive tech.
          </li>
          <li>
            With a thumb focused: the arrow keys nudge by <InlineCode>step</InlineCode>; Page Up /
            Page Down, or an arrow with Space or Shift held, jump by a larger interval; Home / End
            go to the minimum / maximum. The directions mirror in RTL.
          </li>
          <li>
            A name is required (<InlineCode>aria-label</InlineCode> /{' '}
            <InlineCode>aria-labelledby</InlineCode>); a range slider also names each thumb via{' '}
            <InlineCode>thumbLabels</InlineCode>.
          </li>
          <li>
            <InlineCode>formatOptions</InlineCode> formats the announced value;{' '}
            <InlineCode>showValueLabel</InlineCode> adds a visible value pill while dragging or
            keyboard-focused.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Compose ships one size (16px track, 44px handle); the Expressive sizes{' '}
            <InlineCode>xs–xl</InlineCode> follow the M3 spec&apos;s measurements — tracks 16 / 24 /
            40 / 56 / 96px, handles 44 / 44 / 52 / 68 / 108px.
          </li>
          <li>
            Active track and handle are <InlineCode>primary</InlineCode>, the inactive track{' '}
            <InlineCode>secondary-container</InlineCode>; the 4px handle narrows to 2px while
            pressed, dragged or keyboard-focused, with a gap each side.
          </li>
          <li>
            The track geometry ports Compose&apos;s <InlineCode>drawTrack</InlineCode> as CSS length
            expressions, so the first server render is exact and resizing needs no measuring; range
            and centred tracks carry stop indicators at both ends.
          </li>
          <li>
            Inset icons follow MDC — a <InlineCode>startIcon</InlineCode> 10px inside the active
            track&apos;s start and an <InlineCode>endIcon</InlineCode> 10px inside the inactive end
            (replacing the stop) on sizes md and up. When the active track is too short for the
            start icon, it moves to the start of the inactive track (M3). Centred sliders ignore
            inset icons, as M3 advises. The value indicator pill is not in Compose&apos;s default
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
