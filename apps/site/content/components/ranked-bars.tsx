import type { ComponentDoc } from './doc';
import { barListTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['list', 'row', 'name', 'track', 'bar', 'figure'];

/** RankedBars page body: examples, when to use them, behaviour, parts and tokens. */
export async function RankedBarsBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Largest first, with the rest last',
      file: 'ranked-bars/ranked-bars-cities',
      name: 'RankedBarsCities',
    },
    {
      title: "A checkout funnel, each step's share of the one before",
      file: 'ranked-bars/ranked-bars-funnel',
      name: 'RankedBarsFunnel',
    },
    {
      title: 'In a narrow column, names on a line of their own',
      file: 'ranked-bars/ranked-bars-narrow',
      name: 'RankedBarsNarrow',
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
            <InlineCode>RankedBars</InlineCode> answers which part is bigger: orders by city, pages
            by visits, the questions asked most. Each row is a name, a bar and an amount, largest
            first, with the rest in one quieter row last. <InlineCode>FunnelBars</InlineCode>{' '}
            answers where people drop out: the steps of a checkout or a sign-up in the order people
            take them, each after the first with its share of the step before.
          </p>
          <p className={TEXT}>
            Use them where a donut would go: bars on one scale compare more exactly than slices. For
            parts that make up one whole, use a Segmented bar; for change over time, a Bar chart or
            a Line chart. M3 has no charts, so they follow M3&apos;s colour roles, type scale and
            springs instead of a spec.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="ranked-bars" className={HEADING}>
            Ranked bars
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>rows</InlineCode> are <InlineCode>{'{ key, label, value }'}</InlineCode>.
              With <InlineCode>sort=&quot;descending&quot;</InlineCode>, the default, the largest
              comes first; <InlineCode>sort=&quot;none&quot;</InlineCode> keeps your order, for rows
              that have one of their own, such as age bands.
            </li>
            <li>
              A row marked <InlineCode>rest</InlineCode> (&quot;Everywhere else&quot;) goes last
              whatever its size, in the quiet colour and dotted, so the remainder never ranks among
              the parts. The other bars take the charts&apos; first colour slot, built from the
              theme&apos;s primary.
            </li>
            <li>
              Every bar is drawn against the largest amount shown, the rest row&apos;s included. A
              value below nought counts as nought on the scale and prints as it is; one that
              isn&apos;t a number ranks below every number and prints{' '}
              <InlineCode>labels.noValue</InlineCode> (&quot;No value&quot;), never &quot;NaN&quot;.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="funnel-bars" className={HEADING}>
            Funnel bars
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>steps</InlineCode> are <InlineCode>{'{ key, label, value }'}</InlineCode>,
              in the order people take them. A funnel is never ranked: its order is the point.
            </li>
            <li>
              Each step after the first says its share of the step before,{' '}
              <InlineCode>labels.ofPrevious</InlineCode> (&quot;65% of the step before&quot;),
              written by <InlineCode>formatShare</InlineCode> (a whole percentage by default). A
              step says none when the step before has nothing above nought, or when its own value
              isn&apos;t a number.
            </li>
            <li>The bars are on one scale, against the largest step.</li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Names, bars and amounts are three columns of one grid, so every bar is on the same
              scale whatever its row&apos;s words. The names&apos; column takes up to 14rem (the{' '}
              <InlineCode>name-width</InlineCode> token); a long name wraps and is never cut.
            </li>
            <li>
              Under 18rem of its own width, through a container query, a name takes a line with its
              amount at the end and its bar runs the whole width under it, so the server&apos;s HTML
              is right at any width.
            </li>
            <li>
              <InlineCode>formatValue</InlineCode> writes the amounts (the page&apos;s locale by
              default).
            </li>
            <li>
              The bars grow from nothing one after another when the list first comes into view, and
              a change moves every bar at once, on the spatial spring. A list on screen as the page
              loads shows its bars at once, from the server&apos;s HTML.
            </li>
            <li>
              In a <InlineCode>ChartFrame</InlineCode>, the frame&apos;s title names the list,
              unless it has an <InlineCode>aria-label</InlineCode> of its own. They give the frame
              no table, since every figure is already printed, so the frame shows no table switch
              unless you pass it a <InlineCode>table</InlineCode>.
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
          Set the tokens below on the list or any ancestor; both components share them. The
          bars&apos; colour is the charts&apos; first slot,{' '}
          <InlineCode>--wm-chart-color-1</InlineCode>, and the rest row&apos;s is{' '}
          <InlineCode>--wm-chart-quiet</InlineCode>. <InlineCode>className</InlineCode> goes on the
          root. Style each part with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />
          , and on a funnel also <InlineCode>note</InlineCode>, each step&apos;s share of the one
          before.
        </p>
        <TokenTable set={barListTokenSet} caption="RankedBars and FunnelBars tokens" />
      </section>
    ),
  };
}
