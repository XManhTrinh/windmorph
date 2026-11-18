import type { ComponentDoc } from './doc';
import { chartTokenSet, lineChartTokenSet } from '@windmorph/react-pro/charts';
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
  'line',
  'wash',
  'point',
  'hairline',
  'gridline',
  'valueAxis',
  'placeAxis',
  'tick',
  'readout',
  'readoutTitle',
  'readoutRow',
  'readoutValue',
  'readoutKey',
  'readoutName',
];

/** LineChart page body: examples, when to use it, behaviour, parts and tokens. */
export async function LineChartBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Sign-ups against last year',
      file: 'line-chart/line-chart-compare',
      name: 'LineChartCompare',
    },
    {
      title: 'Below nought, with a gap',
      file: 'line-chart/line-chart-temperature',
      name: 'LineChartTemperature',
    },
    {
      title: 'A window of live figures',
      file: 'line-chart/line-chart-live',
      name: 'LineChartLive',
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
            How something changed over time: one subject with a wash under its line, and other lines
            to compare it with, such as this year against last. People read it by pointer, finger
            and keyboard, and in a <InlineCode>ChartFrame</InlineCode> every value is in a table
            too.
          </p>
          <p className={TEXT}>
            M3 has no charts, so this one follows Material&apos;s data visualisation guidance with
            M3&apos;s colour roles, type scale and springs. For a total made of parts over time, use
            a Bar chart; for one number and how it moved, a Stat tile. A line chart has one value
            axis: two measures on different scales are two charts.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="places-and-series" className={HEADING}>
            Places and series
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>places</InlineCode> are the steps along the bottom, oldest first. Each has
              a <InlineCode>key</InlineCode>, a short <InlineCode>tick</InlineCode> for the axis
              (&quot;1 Jun&quot;) and a full <InlineCode>name</InlineCode> for the readout, the
              table and screen readers (&quot;Week of 1 June&quot;).
            </li>
            <li>
              Each of the <InlineCode>series</InlineCode> has a <InlineCode>key</InlineCode>, a{' '}
              <InlineCode>label</InlineCode> and one value per place, in the places&apos; order.{' '}
              <InlineCode>null</InlineCode>, or anything that isn&apos;t a finite number, is no
              value there.
            </li>
            <li>
              Keep the keys steady: a place that keeps its <InlineCode>key</InlineCode> when the
              period changes moves instead of being redrawn, and a series that keeps its own keeps
              its colour.
            </li>
            <li>
              <InlineCode>subject</InlineCode> is the series the chart is about: it gets the wash
              under its line. With one series it is that one; with several and no{' '}
              <InlineCode>subject</InlineCode>, no line has a wash.
            </li>
            <li>
              <InlineCode>curve=&quot;monotone&quot;</InlineCode>, the default, is smooth and never
              passes a value; <InlineCode>curve=&quot;linear&quot;</InlineCode> joins the points
              with straight lines.
            </li>
            <li>
              Series take the colour slots in order and keep theirs when another is hidden;{' '}
              <InlineCode>slot</InlineCode> pins one (1 to 8), so the same thing is the same colour
              on every chart of a page. Eight series are drawn; a ninth and later are only in a
              frame&apos;s table view, and development builds warn.
            </li>
            <li>
              The side labels run from nought, or from the least value below it, to a round number
              in about four steps: in full under 10,000 and compact above, with the decimals the
              step needs. Under 224px of plot every other one shows. The bottom labels thin out by
              container queries, every few counted back from the newest, which always shows, so the
              server&apos;s HTML is right at any width.
            </li>
            <li>
              <InlineCode>formatValue</InlineCode> writes the figures in the readout, the table and
              what screen readers hear, so put the unit there, as the temperature example does;{' '}
              <InlineCode>formatAxis</InlineCode> writes the side labels. Both default to the
              page&apos;s locale.
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
              The pointer and a finger find the nearest place, not a mark: a hairline stands there,
              a point sits on each line, and the readout lists every series on show at that place,
              the value first and strong, then whose it is with its key. The readout keeps to the
              side of the place with more room.
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
              Screen readers hear the slider&apos;s value: the place&apos;s name, then each series
              on show with its value (&quot;Week of 1 June: This year 1,180, Last year 980&quot;).{' '}
              <InlineCode>labels.describePlace</InlineCode> writes your own sentence. The slider is
              a native range input, so a phone&apos;s screen reader can step it too.
            </li>
            <li>
              The readout is hidden from assistive technology: it adds to the value and never
              replaces it, and every value is in a frame&apos;s table view as well.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="below-nought-and-gaps" className={HEADING}>
            Below nought, and gaps
          </h2>
          <ul className={LIST}>
            <li>
              With a value below nought, the axis runs below a nought line, drawn as the baseline,
              and the subject&apos;s wash runs from its line to that line.
            </li>
            <li>
              A place with no value is a gap: the line breaks there, no point shows when it&apos;s
              read, and the readout, the value and the table say &quot;No value&quot; (
              <InlineCode>labels.noValue</InlineCode>). There&apos;s no need to invent a zero.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="motion" className={HEADING}>
            Motion
          </h2>
          <ul className={LIST}>
            <li>
              The lines arrive once, as the chart first comes into view: rising from the nought line
              (<InlineCode>entrance=&quot;rise&quot;</InlineCode>, the default), or drawn on from
              the start (<InlineCode>entrance=&quot;draw&quot;</InlineCode>). A chart already on
              screen as the page loads shows its final picture at once, from the server&apos;s HTML.
            </li>
            <li>
              When the numbers change, the lines move from where they are to the new values on the
              theme&apos;s spatial spring, keeping their speed when a change comes mid-move. Places
              are matched by <InlineCode>key</InlineCode>: a kept point slides to its new place, a
              new one comes in along the line, and one that left slides off the plot&apos;s edge (a
              window moving on) or merges into the line (one taken from the middle). With no key
              kept, a new grain (days to weeks), the old line reshapes into the new one.
            </li>
            <li>
              Hiding a series fades its line while the others rescale. Off screen, a change lands at
              once, and an entrance waits until the chart is seen.
            </li>
            <li>
              Under reduced motion nothing moves: the lines take their new shape at once, the
              draw-on is instant, and only the fades run.
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
              <InlineCode>legend</InlineCode> shows it for one series.
            </li>
            <li>
              <InlineCode>hiddenSeries</InlineCode>, <InlineCode>defaultHiddenSeries</InlineCode>{' '}
              and <InlineCode>onHiddenSeriesChange</InlineCode> keep which are hidden, controlled or
              not. A hidden series leaves the readout and the value, and the axis rescales to what
              shows.
            </li>
            <li>
              <InlineCode>ChartLegend</InlineCode> and <InlineCode>ChartTooltip</InlineCode> are
              those parts on their own, for a layout of your own: one legend for several charts, or
              a readout for a chart you draw yourself. <InlineCode>ChartLegend</InlineCode> is a
              list of keys, or chips once it has <InlineCode>hiddenSeries</InlineCode>,{' '}
              <InlineCode>defaultHiddenSeries</InlineCode> or{' '}
              <InlineCode>onHiddenSeriesChange</InlineCode>. <InlineCode>ChartTooltip</InlineCode>{' '}
              is drawn as the core&apos;s rich tooltip and is hidden from assistive technology, so
              what it shows must be said another way too.
            </li>
            <li>
              <InlineCode>chartColor(slot)</InlineCode> gives a slot&apos;s colour as the charts
              draw it, for those parts&apos; <InlineCode>color</InlineCode> or a mark of your own:{' '}
              <InlineCode>chartColor(2)</InlineCode> follows the theme, its mode and contrast level,
              and an app&apos;s <InlineCode>--wm-chart-color-2</InlineCode>. It reads the palette a
              chart, a legend or a readout brings to the page, so use it where one of them shows,
              and pin the series to the same slots with <InlineCode>slot</InlineCode>.
            </li>
            <li>
              With two or more series, each line has a dash pattern of its own (slot 1 stays solid),
              and its keys to match, for anyone who doesn&apos;t tell the colours apart;{' '}
              <InlineCode>texture={'{false}'}</InlineCode> turns them off. Forced colours always
              draw them. Printed, the colours stay.
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
            table, a row per place and a column per series, every series past the eighth included,
            with the chart&apos;s own figures and &quot;No value&quot; for a gap.{' '}
            <InlineCode>placeLabel</InlineCode> names the places&apos; column (&quot;Week&quot;).
            The frame keeps the chart&apos;s height for the table, dims the lines while{' '}
            <InlineCode>pending</InlineCode>, and draws the chart on its card&apos;s colour. Outside
            a frame, name the chart with <InlineCode>aria-label</InlineCode> or{' '}
            <InlineCode>aria-labelledby</InlineCode>; development builds warn about a chart with
            neither.
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
          Set the tokens below on the chart or any ancestor. The draw-on&apos;s motion is the line
          chart&apos;s own; its colours, line, points, wash, gridlines and state changes come from
          the <InlineCode>--wm-chart-*</InlineCode> set every chart shares. A line chart paints with
          the colour slots, <InlineCode>surface</InlineCode>, <InlineCode>line-width</InlineCode>,{' '}
          <InlineCode>point-radius</InlineCode>, <InlineCode>point-ring</InlineCode>,{' '}
          <InlineCode>wash-opacity</InlineCode>, <InlineCode>grid</InlineCode>,{' '}
          <InlineCode>axis</InlineCode>, <InlineCode>axis-text</InlineCode>,{' '}
          <InlineCode>legend-gap</InlineCode> and the state timing; the ramp, the warning and
          critical colours and the bar tokens are other charts&apos;.
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
        <TokenTable set={lineChartTokenSet} caption="LineChart tokens" />
        <TokenTable set={chartTokenSet} caption="Chart tokens, shared by every chart" />
      </section>
    ),
  };
}
