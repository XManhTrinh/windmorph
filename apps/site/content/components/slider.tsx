import { sliderTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SliderDiscrete = lazyExample('slider/slider-discrete', 'SliderDiscrete');
const SliderRange = lazyExample('slider/slider-range', 'SliderRange');
const SliderSizes = lazyExample('slider/slider-sizes', 'SliderSizes');
const SliderValueLabel = lazyExample('slider/slider-value-label', 'SliderValueLabel');
const SliderVertical = lazyExample('slider/slider-vertical', 'SliderVertical');

/** Slider + RangeSlider page body. */
export async function SliderBody(): Promise<ComponentDoc> {
  const [sizes, valueLabel, discrete, range, vertical] = await Promise.all([
    readExampleSource('slider/slider-sizes.tsx'),
    readExampleSource('slider/slider-value-label.tsx'),
    readExampleSource('slider/slider-discrete.tsx'),
    readExampleSource('slider/slider-range.tsx'),
    readExampleSource('slider/slider-vertical.tsx'),
  ]);
  const [sizesHtml, valueLabelHtml, discreteHtml, rangeHtml, verticalHtml] = await Promise.all([
    highlightSource(sizes),
    highlightSource(valueLabel),
    highlightSource(discrete),
    highlightSource(range),
    highlightSource(vertical),
  ]);

  return {
    tokens: [sliderTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Vertical"
            code={vertical}
            html={verticalHtml}
            fileName="slider-vertical.tsx"
          >
            <SliderVertical />
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
              Compose ships one size (16px track, 44px handle); the Expressive sizes{' '}
              <InlineCode>xs–xl</InlineCode> follow the M3 spec&apos;s measurements — tracks 16 / 24
              / 40 / 56 / 96px, handles 44 / 44 / 52 / 68 / 108px.
            </li>
            <li>
              Active track and handle are <InlineCode>primary</InlineCode>, the inactive track{' '}
              <InlineCode>secondary-container</InlineCode>; the 4px handle narrows to 2px while
              pressed, dragged or keyboard-focused, with a gap each side.
            </li>
            <li>
              The track geometry ports Compose&apos;s <InlineCode>drawTrack</InlineCode> as CSS
              length expressions, so the first server render is exact and resizing needs no
              measuring; range and centred tracks carry stop indicators at both ends.
            </li>
            <li>
              Stop indicators and ticks use the M3 token table&apos;s colours, not Compose&apos;s
              code: <InlineCode>on-primary</InlineCode> on the active track and{' '}
              <InlineCode>on-secondary-container</InlineCode> on the inactive one (disabled,{' '}
              <InlineCode>inverse-on-surface</InlineCode> and <InlineCode>on-surface</InlineCode> at
              38%).
            </li>
            <li>
              Inset icons follow MDC — a <InlineCode>startIcon</InlineCode> 10px inside the active
              track&apos;s start and an <InlineCode>endIcon</InlineCode> 10px inside the inactive
              end (replacing the stop) on sizes md and up. When the active track is too short for
              the start icon, it moves to the start of the inactive track (M3). Centred sliders and
              XS / S sliders ignore inset icons (with a development warning), as M3 advises. The
              value indicator pill is not in Compose&apos;s default slider.
            </li>
            <li>
              On touch screens it behaves like Compose&apos;s draggable slider: a swipe across the
              slider scrolls the page and leaves the value alone, a tap on the track sets the value
              when the finger lifts, and a drag along the track moves the nearest thumb once it
              passes 8px. Mouse presses set the value at once.
            </li>
            <li>
              <strong>Deviation:</strong> there are no haptics. A press on a discrete track maps
              through the same corner inset its stops are drawn with, so a tap on a drawn stop
              selects that stop at every size.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
