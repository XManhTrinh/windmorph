import type { ComponentDoc } from './doc';
import { segmentedTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const BAR_SLOTS = [
  'strip',
  'part',
  'fill',
  'share',
  'legend',
  'legendItem',
  'legendKey',
  'readout',
  'readoutTitle',
  'readoutRow',
  'readoutValue',
  'readoutKey',
  'readoutName',
];
const LIST_SLOTS = ['strip', 'part', 'fill', 'list', 'row', 'key', 'name', 'share', 'figure'];

/** SegmentedBar page body: examples, when to use it, behaviour, parts and tokens. */
export async function SegmentedBarBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Parts of a whole, and more than six folded into "Other"',
      file: 'segmented-bar/segmented-bar-parts',
      name: 'SegmentedBarParts',
    },
    {
      title: 'Answers in order, from "Never" to "Always"',
      file: 'segmented-bar/segmented-bar-ordered',
      name: 'SegmentedBarOrdered',
    },
    {
      title: 'A list of the parts with their shares and amounts',
      file: 'segmented-bar/segmented-bar-list',
      name: 'SegmentedBarList',
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
            How one whole splits, at a glance: visits by device, orders by channel, a survey&apos;s
            answers. <InlineCode>SegmentedBar</InlineCode> draws each part as a block as wide as its
            share, prints the share on it where it fits, and names the parts in a key below.{' '}
            <InlineCode>SegmentedList</InlineCode> draws the same parts as a thin bar that prints
            nothing, with each part&apos;s name, share and amount listed under it, for a narrow card
            or a side panel.
          </p>
          <p className={TEXT}>
            Use it where a pie or a donut would go: lengths along one line compare more exactly than
            angles. Two to five parts read best. To compare parts that don&apos;t add up to one
            whole, use Ranked bars; for one amount against a limit, a Meter. M3 has no charts, so it
            follows M3&apos;s colour roles, shapes and springs instead of a spec.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="parts-and-other" className={HEADING}>
            Parts and &quot;Other&quot;
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>parts</InlineCode> are <InlineCode>{'{ key, label, value }'}</InlineCode>,
              drawn in the order you give them. Keep each <InlineCode>key</InlineCode> the same
              across updates, so its block moves rather than being replaced. Colours go by order, so
              a part added before others moves their colours along; pin{' '}
              <InlineCode>slot</InlineCode> to keep a part&apos;s colour when parts come and go.
            </li>
            <li>
              Six parts at most are drawn, since more stop being told apart by colour. Past six, the
              first five are drawn and the rest fold into one quiet part,{' '}
              <InlineCode>labels.other</InlineCode> (&quot;Other&quot;), whose amount is their sum.
              Put the largest first, so the smallest are the ones that fold.
            </li>
            <li>
              Shares are of the whole. A value below nought, or one that isn&apos;t a number, counts
              as nothing toward it, while the readout, the list and the table still give the
              part&apos;s own value; one that isn&apos;t a number reads{' '}
              <InlineCode>labels.noValue</InlineCode> (&quot;No value&quot;), never &quot;NaN&quot;.
              A part that counts as nothing draws nothing, on a bar and on a list&apos;s thin bar,
              though it keeps its key and its row; any other part keeps at least a 4px sliver.
            </li>
            <li>
              Each part takes the next of the charts&apos; eight colour slots, the first built from
              the theme&apos;s primary; <InlineCode>slot</InlineCode> (1 to 8) pins one, so the same
              thing is the same colour on every chart of a page. &quot;Other&quot; takes the quiet
              colour.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="ordered-parts" className={HEADING}>
            Ordered parts
          </h2>
          <p className={TEXT}>
            Parts that have an order (ratings from 1 to 5, age bands, answers from &quot;Never&quot;
            to &quot;Always&quot;) take <InlineCode>ordered</InlineCode>: one hue, the theme&apos;s
            ramp from its lightest step to its darkest in light mode, the reverse in dark. Its five
            steps are spread over the parts in their order, so three parts take the first, middle
            and last steps. A pinned <InlineCode>slot</InlineCode> doesn&apos;t apply. Five ordered
            parts are drawn at most: past five, the first four are drawn and the rest fold into
            &quot;Other&quot;, and a development build warns.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Each part of a bar but &quot;Other&quot; prints its share where it is at least 2.75rem
              wide (44px at the default text size, so larger text needs a wider part rather than
              clipping it), in white or black, whichever reads at 4.5:1 on its colour. A narrower
              part leaves it to the readout, the slider&apos;s value text and a frame&apos;s table
              view. <InlineCode>formatShare</InlineCode> writes shares and{' '}
              <InlineCode>formatValue</InlineCode> amounts, in the page&apos;s locale by default. A
              share is a whole percentage by default, but one above nought never reads
              &quot;0%&quot; (under 0.5% it keeps one significant digit, &quot;0.3%&quot;), nor one
              short of the whole &quot;100%&quot; (&quot;99.9%&quot;).
            </li>
            <li>
              The pointer reads the part under it, each part as wide as its share (in the gap
              between two, the nearer): a readout below the bar, by the part on its side with more
              room and never wider than the bar, gives its name, share and amount, and the other
              parts step back, dimming their colour but not their figures. A press or a tap reads a
              part and moves focus to the bar, so the arrow keys go on from it. A finger slides
              along the bar to read it while the page still scrolls up and down.
            </li>
            <li>
              From the keyboard the bar is one stop that starts on the first part: the arrow keys
              step through the parts, and Home and End go to the first and the last. Screen readers
              hear each part with where it is among them (&quot;Phone: 5,120, 59%, 1 of 3&quot;,{' '}
              <InlineCode>labels.describePart</InlineCode>). Escape hides the readout until another
              part, the pointer coming back or focus shows it again. A list has nothing to step
              through; its rows print every figure.
            </li>
            <li>
              Patterns are on by default once there are two or more parts: each part and its key
              carry one (the first slot solid, a hatch for each slot after it, and a pattern per
              step when ordered), for anyone who doesn&apos;t tell the colours apart;{' '}
              <InlineCode>texture={'{false}'}</InlineCode> turns them off. &quot;Other&quot; is
              always dotted, and forced colours always draw the patterns. Printed, the colours stay.
            </li>
            <li>
              The parts grow to their shares when the bar first comes into view, and a change moves
              them to their new shares, on the spatial spring. One on screen as the page loads shows
              its shares at once, from the server&apos;s HTML.
            </li>
            <li>
              In a <InlineCode>ChartFrame</InlineCode>, the frame&apos;s title names it, unless it
              has an <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>{' '}
              of its own. A <InlineCode>SegmentedBar</InlineCode> gives the frame its parts for the
              table view (part, amount and share); a <InlineCode>SegmentedList</InlineCode> gives
              none, since its rows are its figures. While the frame is{' '}
              <InlineCode>pending</InlineCode>, the parts&apos; colours dim and their figures keep
              their contrast.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the bar, the list or any ancestor. The parts&apos; colours are the
          colour slots and ramp every chart shares (<InlineCode>--wm-chart-color-1</InlineCode> to{' '}
          <InlineCode>--wm-chart-color-8</InlineCode>, <InlineCode>--wm-chart-step-1</InlineCode> to{' '}
          <InlineCode>--wm-chart-step-5</InlineCode> and <InlineCode>--wm-chart-quiet</InlineCode>{' '}
          for &quot;Other&quot;), and the readout is the core&apos;s rich tooltip, themed by its own{' '}
          <InlineCode>--md-comp-rich-tooltip-*</InlineCode> tokens.{' '}
          <InlineCode>className</InlineCode> goes on the root. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: on a bar, <CodeList names={BAR_SLOTS} />; on a list,{' '}
          <CodeList names={LIST_SLOTS} />.
        </p>
        <TokenTable set={segmentedTokenSet} caption="SegmentedBar and SegmentedList tokens" />
      </section>
    ),
  };
}
