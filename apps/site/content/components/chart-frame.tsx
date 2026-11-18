import type { ComponentDoc } from './doc';
import { chartFrameTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'header',
  'heading',
  'title',
  'description',
  'actions',
  'toggle',
  'content',
  'view',
  'table',
  'empty',
  'error',
  'retry',
  'loading',
];

/** ChartFrame page body: examples, when to use it, behaviour, parts and tokens. */
export async function ChartFrameBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'A chart that switches to its table',
      file: 'chart-frame/chart-frame-table',
      name: 'ChartFrameTable',
    },
    {
      title: 'In a narrow column, the table becomes a list of figures',
      file: 'chart-frame/chart-frame-narrow',
      name: 'ChartFrameNarrow',
    },
    {
      title: 'Empty, loading, error and pending',
      file: 'chart-frame/chart-frame-states',
      name: 'ChartFrameStates',
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
            The card a chart sits in on a dashboard or a report: a title that names the chart, a
            line on what it shows, your own controls, and a switch to the chart&apos;s twin, a table
            of the same numbers. It also covers the times there is no picture to show: nothing to
            draw, the first numbers loading, new ones on the way, and a failure.
          </p>
          <p className={TEXT}>
            It is the core <InlineCode>Card</InlineCode> (<InlineCode>filled</InlineCode> by
            default; <InlineCode>elevated</InlineCode> and <InlineCode>outlined</InlineCode> too),
            so a card theme reaches it. M3 has no charts, so it follows M3&apos;s colour roles, type
            scale and springs instead of a spec. A chart that needs no title or table, such as a
            sparkline in a tile, can stand on its own.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="title-and-header" className={HEADING}>
            Title and header
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>title</InlineCode> is a heading, <InlineCode>h3</InlineCode> unless{' '}
              <InlineCode>headingLevel</InlineCode> says otherwise, and names every chart and list
              of figures inside, unless it has an <InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode> of its own. A development build warns about a
              chart with neither a name nor a frame.
            </li>
            <li>
              <InlineCode>description</InlineCode> sits under the title: the period, the unit, what
              is counted.
            </li>
            <li>
              <InlineCode>actions</InlineCode> holds your own controls (a period switch, a menu),
              before the table switch.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="table-view" className={HEADING}>
            Table view
          </h2>
          <ul className={LIST}>
            <li>
              A line chart, a bar chart or a segmented bar inside gives the frame its numbers, as it
              formats them, and the frame offers a switch, &quot;Show as a table&quot; (
              <InlineCode>labels.showTable</InlineCode>), pressed while the table shows. Lists,
              meters and stat tiles give none, since their figures are already printed, so the
              switch isn&apos;t there. With several charts inside, the table shows the first&apos;s.
            </li>
            <li>
              The table is a plain <InlineCode>DataTable</InlineCode> named by the title: the places
              or parts as row headers, the figures aligned at the end. It keeps the chart&apos;s
              height, its rows scrolling under the header, so the cards around it don&apos;t move.
              Narrower than 600px of its own width, it becomes a list of figures, one row per place
              or part.
            </li>
            <li>
              The data table loads the first time it&apos;s asked for, or as the switch is pointed
              at or focused, so a frame that is only looked at never carries it. The switch comes
              once the chart has given its numbers, after the page&apos;s script runs.
            </li>
            <li>
              The chart stays in the page, hidden, while the table shows, so going back never
              replays its entrance. The view that shows, the table or the chart again (as the switch
              or a state that ends turns to it), fades in where it stands on an effects spring (
              <InlineCode>--wm-chart-frame-view-duration</InlineCode>), only once the frame is on
              screen, so nothing fades as the page loads.
            </li>
            <li>
              <InlineCode>showTable</InlineCode> and <InlineCode>onShowTableChange</InlineCode>{' '}
              control the view, or <InlineCode>defaultShowTable</InlineCode> sets where it starts.{' '}
              <InlineCode>table</InlineCode> replaces the generated rows with your own{' '}
              <InlineCode>{'{ columns, rows }'}</InlineCode> of text, and{' '}
              <InlineCode>{'table={false}'}</InlineCode> takes the switch away.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="states" className={HEADING}>
            States
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>pending</InlineCode>: new numbers are loading. The last picture stays, its
              marks dimmed and its words at full contrast, and the chart area is{' '}
              <InlineCode>aria-busy</InlineCode>; while the table shows, its loading bar shows over
              the rows too. Use it for a period change or a refresh. With an{' '}
              <InlineCode>error</InlineCode> showing, Try again shows its progress indicator
              instead.
            </li>
            <li>
              <InlineCode>loading</InlineCode>: there is no picture yet. A placeholder fills the
              chart area and screen readers hear <InlineCode>labels.loading</InlineCode>{' '}
              (&quot;Loading&quot;).
            </li>
            <li>
              <InlineCode>error</InlineCode>: your message in place of the chart, under an error
              icon, with a &quot;Try again&quot; button (<InlineCode>labels.retry</InlineCode>) when
              you pass <InlineCode>onRetry</InlineCode>.
            </li>
            <li>
              <InlineCode>empty</InlineCode>: words, or an <InlineCode>EmptyState</InlineCode>, in
              place of the chart when there is nothing to draw. You decide when that is (
              <InlineCode>{"empty={rows.length ? undefined : 'No orders yet'}"}</InlineCode>), since
              the frame can&apos;t see into lists and meters.
            </li>
            <li>
              The title stays in every state and the switch goes. One state shows at a time:{' '}
              <InlineCode>error</InlineCode> first, then <InlineCode>loading</InlineCode>, then{' '}
              <InlineCode>empty</InlineCode>, as a <InlineCode>DataTable</InlineCode> orders its
              states, so the pattern above never hides a first load or a failure. An{' '}
              <InlineCode>empty</InlineCode> or <InlineCode>error</InlineCode> given as a failed{' '}
              <InlineCode>{"cond && 'Words'"}</InlineCode> (<InlineCode>false</InlineCode>) is no
              state, as React draws nothing for it. <InlineCode>minHeight</InlineCode> (240px at the
              default text size, growing with larger text) is the chart area&apos;s least height, so
              a state or a table keeps it.
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
          Set the tokens below on the frame or any ancestor. The card is the core&apos;s, so its{' '}
          <InlineCode>--md-comp-card-*</InlineCode> tokens paint the container, and the charts
          inside draw their point rings and the gaps between their marks in the card&apos;s colour.{' '}
          <InlineCode>icons</InlineCode> replaces the switch&apos;s and the error&apos;s icons.{' '}
          <InlineCode>className</InlineCode> goes on the card. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={chartFrameTokenSet} caption="ChartFrame tokens" />
      </section>
    ),
  };
}
