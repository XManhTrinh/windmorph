import type { ComponentDoc } from './doc';
import { chartTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'legend',
  'legendItem',
  'legendKey',
  'body',
  'plot',
  'marks',
  'bar',
  'gridline',
  'valueAxis',
  'placeAxis',
  'tick',
  'readout',
  'readoutTitle',
  'readoutRow',
  'readoutValue',
  'readoutTotal',
];

/** BarChart page body: examples, when to use it, behaviour, parts and tokens. */
export async function BarChartBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Orders by channel, over 6 or 12 weeks',
      file: 'bar-chart/bar-chart-stacked',
      name: 'BarChartStacked',
    },
    {
      title: 'Money in and out, below nought',
      file: 'bar-chart/bar-chart-below-nought',
      name: 'BarChartBelowNought',
    },
    {
      title: 'One legend for two charts',
      file: 'bar-chart/bar-chart-shared-legend',
      name: 'BarChartSharedLegend',
    },
  ]);
  return {
    overview,
    guidelines: (
      <>
        <section className={SECTION}>
          <h2 id="purpose" className={HEADING}>
            Purpose
          </h2>
          <p className={TEXT}>
            What a total was made of, over time: a column at each place, for one series or several
            stacked into a total. People read it by pointer, finger and keyboard, and in a{' '}
            <InlineCode>ChartFrame</InlineCode> every value is in a table too.
          </p>
          <p className={TEXT}>
            M3 has no charts, so this one follows Material&apos;s data visualisation guidance with
            M3&apos;s colour roles, shapes and springs. To rank parts against each other, use Ranked
            bars; for a trend across many places, a Line chart; for one whole split into parts, a
            Segmented bar. Bars stand upright and stack: grouped (side by side) and horizontal bars
            aren&apos;t part of it.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="places-and-series" className={HEADING}>
            Places and series
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>places</InlineCode> are the slots along the bottom, oldest first. Each has
              a <InlineCode>key</InlineCode>, a short <InlineCode>tick</InlineCode> for the axis
              (&quot;Jan&quot;) and a full <InlineCode>name</InlineCode> for the readout, the table
              and screen readers (&quot;January 2026&quot;). The first and last ticks stay inside
              the plot.
            </li>
            <li>
              Each of the <InlineCode>series</InlineCode> has a <InlineCode>key</InlineCode>, a{' '}
              <InlineCode>label</InlineCode> and one value per place, in the places&apos; order.{' '}
              <InlineCode>null</InlineCode>, or anything that isn&apos;t a finite number, is no
              value there. Keep the keys steady, so a bar moves instead of being redrawn and a
              series keeps its colour.
            </li>
            <li>
              Several series stack in the order given, the first at the bottom. Only the outer end
              of each stack is rounded; the base stays square on the baseline, and touching parts
              are kept apart by 2px of the chart&apos;s surface colour.
            </li>
            <li>
              A bar takes 62% of its slot and at most 24px, so bars never touch. Series take the
              colour slots in order and keep theirs when another is hidden;{' '}
              <InlineCode>slot</InlineCode> pins one (1 to 8). Eight series are drawn; a ninth and
              later are only in a frame&apos;s table view, and development builds warn.
            </li>
            <li>
              The side labels run from nought, or from the lowest stack below it, to a round number
              in about four steps, in full under 10,000 and compact above. Under 224px of plot every
              other one shows. <InlineCode>formatValue</InlineCode> writes the figures in the
              readout, the table and what screen readers hear; <InlineCode>formatAxis</InlineCode>{' '}
              writes the side labels. Both default to the page&apos;s locale.
            </li>
            <li>
              <InlineCode>minHeight</InlineCode> (240px) is the plot&apos;s least height; the chart
              grows to the height its container gives it.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="reading-it" className={HEADING}>
            Reading it
          </h2>
          <ul className={LIST}>
            <li>
              The pointer and a finger read a whole slot, not just its bar: that place&apos;s bars
              stay and the others step back. The readout lists every series on show there, the value
              first and strong, then whose it is with its key, and with two or more series their
              total (<InlineCode>labels.total</InlineCode>). It keeps to the side of the place with
              more room.
            </li>
            <li>
              A finger scrubs sideways while the page still scrolls up and down. A tap reads its
              place and keeps it, and so does a click once the pointer leaves; a finger that scrolls
              the page instead reads nothing.
            </li>
            <li>
              From the keyboard the chart is one tab stop, after its legend: a slider over the
              places. The arrow keys step, Home and End go to the first and the newest place, and
              Page Up and Page Down move a tenth of the places. It starts on the newest place, or on
              the one just pressed. Right to left, the arrows follow the chart: Arrow Left moves
              forward.
            </li>
            <li>
              Screen readers hear the slider&apos;s value: the place&apos;s name, each series on
              show with its value, then the total (&quot;Week of 1 June: Web 312, Phone 146, In
              store 88. Total 546&quot;). <InlineCode>labels.describePlace</InlineCode> writes your
              own sentence. The readout is hidden from assistive technology, since the value says
              the same.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="below-nought-and-gaps" className={HEADING}>
            Below nought, and gaps
          </h2>
          <ul className={LIST}>
            <li>
              A value below nought goes down from a nought line, under the parts below it, so a
              stack&apos;s total is what it draws: 10 in and −4 out draw 10 up and 4 down, and total
              6. Its outer end, at the bottom, is the rounded one.
            </li>
            <li>
              A place a series has no value at draws no bar for it, and says &quot;No value&quot; (
              <InlineCode>labels.noValue</InlineCode>); where no series has a value, the total says
              it too, never 0.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="motion" className={HEADING}>
            Motion
          </h2>
          <ul className={LIST}>
            <li>
              The bars rise from nought one place after another, once, as the chart first comes into
              view. A chart already on screen as the page loads shows its final picture at once,
              from the server&apos;s HTML.
            </li>
            <li>
              After that, a change moves every bar at once from where it is, on the theme&apos;s
              spatial spring, keeping its speed when a change comes mid-move. Places are matched by{' '}
              <InlineCode>key</InlineCode>: a kept bar slides to its new slot, a new one grows from
              nought at its own, and one that left shrinks to nought and fades as it moves off (off
              the plot&apos;s start, as a window moves on).
            </li>
            <li>
              Reading a place steps the others back with a fade, and hiding a series fades it while
              the rest rescale. Off screen, a change lands at once, and the entrance waits until the
              chart is seen.
            </li>
            <li>
              Under reduced motion nothing moves: bars take their new size and place at once,
              without the one-after-another start, and a place that leaves goes at once. The fades
              still run.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="legend-and-readout" className={HEADING}>
            The legend and the readout
          </h2>
          <ul className={LIST}>
            <li>
              With two or more series the chart draws its legend above the plot: a filter chip for
              each series, with its key, that hides and shows it. The last one shown can&apos;t be
              hidden. <InlineCode>legend={'{false}'}</InlineCode> leaves it out, and{' '}
              <InlineCode>legend</InlineCode> shows it for one series.{' '}
              <InlineCode>hiddenSeries</InlineCode>, <InlineCode>defaultHiddenSeries</InlineCode>{' '}
              and <InlineCode>onHiddenSeriesChange</InlineCode> keep which are hidden, controlled or
              not.
            </li>
            <li>
              <InlineCode>ChartLegend</InlineCode> and <InlineCode>ChartTooltip</InlineCode> are
              those parts on their own: one legend for several charts, as in the example above, or a
              readout for a chart you draw yourself. <InlineCode>ChartLegend</InlineCode> is a list
              of keys, or chips once it has <InlineCode>onHiddenChange</InlineCode>;{' '}
              <InlineCode>ChartTooltip</InlineCode> is drawn as the core&apos;s rich tooltip and is
              hidden from assistive technology, so what it shows must be said another way too.
            </li>
            <li>
              <InlineCode>chartColor(slot)</InlineCode> gives a slot&apos;s colour as the charts
              draw it, for those parts&apos; <InlineCode>color</InlineCode> or a mark of your own,
              following the theme, its mode and contrast level, and an app&apos;s{' '}
              <InlineCode>--wm-chart-color-N</InlineCode>. It reads the palette a chart, a legend or
              a readout brings to the page, so use it where one of them shows, and pin the series to
              the same slots with <InlineCode>slot</InlineCode>.
            </li>
            <li>
              <InlineCode>texture</InlineCode> hatches each series&apos; bars (slot 1 stays solid),
              and its keys to match, for where hue isn&apos;t enough, such as print; forced colours
              turn it on by themselves.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="in-a-frame" className={HEADING}>
            In a frame
          </h2>
          <p className={TEXT}>
            Put the chart in a <InlineCode>ChartFrame</InlineCode>: its title names the chart, so it
            needs no <InlineCode>aria-label</InlineCode>, and its switch shows the same numbers as a
            table, a row per place, a column per series (every series past the eighth included) and,
            with two or more, a Total column, with the chart&apos;s own figures.{' '}
            <InlineCode>placeLabel</InlineCode> names the places&apos; column (&quot;Week&quot;).
            The frame keeps the chart&apos;s height for the table, dims the bars while{' '}
            <InlineCode>pending</InlineCode>, and draws the chart on its card&apos;s colour, so the
            gaps between parts match the card. Outside a frame, name the chart with{' '}
            <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>;
            development builds warn about a chart with neither.
          </p>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          A bar chart has no tokens of its own: set the shared <InlineCode>--wm-chart-*</InlineCode>{' '}
          tokens below on the chart or any ancestor. It paints with the colour slots and their{' '}
          <InlineCode>on-color</InlineCode>s (the hatch of <InlineCode>texture</InlineCode>),{' '}
          <InlineCode>bar-max-thickness</InlineCode>, <InlineCode>bar-share</InlineCode>,{' '}
          <InlineCode>bar-corner</InlineCode>, <InlineCode>mark-gap</InlineCode>,{' '}
          <InlineCode>surface</InlineCode>, <InlineCode>read-dim-opacity</InlineCode>,{' '}
          <InlineCode>grid</InlineCode>, <InlineCode>axis</InlineCode>,{' '}
          <InlineCode>axis-text</InlineCode>, <InlineCode>legend-gap</InlineCode> and the state
          timing; the ramp, the warning and critical colours and the line and point tokens are other
          charts&apos;.
        </p>
        <p className={TEXT}>
          The slots default to a palette made for each built-in theme, mode and contrast level. For
          a theme of your own, pass it through{' '}
          <InlineCode>withChartColors(createTheme(…))</InlineCode> once, beside where you make it;
          without that, charts take the baseline theme&apos;s slots with your primary as slot 1. The
          legend&apos;s chips are the core&apos;s filter chips and the readout is the core&apos;s
          rich tooltip, themed by their own <InlineCode>--md-comp-*</InlineCode> tokens.{' '}
          <InlineCode>className</InlineCode> goes on the root; style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={chartTokenSet} caption="Chart tokens, shared by every chart" />
      </section>
    ),
  };
}
