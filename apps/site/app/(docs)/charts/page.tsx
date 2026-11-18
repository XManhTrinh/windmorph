import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@windmorph/react-pro';
import { chartTokenSet } from '@windmorph/react-pro/charts';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';
import { TokenTable } from '../../../components/token-table';

export const metadata: Metadata = guideMetadata('/charts');

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-6 ${TEXT} list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-4';
const CELL = 'border-b border-outline-variant p-2 text-start align-top';
const HEAD_CELL = `${CELL} text-title-small text-on-surface`;

/** The question each chart answers, and what it is chosen over. */
const QUESTIONS = [
  {
    question: 'One number, and how it moved',
    slug: 'stat-tile',
    chart: 'StatTile',
    instead: 'A chart with one bar',
  },
  {
    question: 'How something changed over time',
    slug: 'line-chart',
    chart: 'LineChart',
    instead: 'Columns for a long run of places',
  },
  {
    question: 'What a total was made of, over time',
    slug: 'bar-chart',
    chart: 'BarChart, stacked',
    instead: 'Several lines that must be added up by eye',
  },
  {
    question: 'One amount against a limit',
    slug: 'meter',
    chart: 'Meter',
    instead: 'A pie of two slices',
  },
  {
    question: 'How one whole splits, at a glance',
    slug: 'segmented-bar',
    chart: 'SegmentedBar, six parts at most',
    instead: 'A donut',
  },
  {
    question: 'Which part is bigger',
    slug: 'ranked-bars',
    chart: 'RankedBars',
    instead: 'A donut',
  },
  {
    question: 'Where people drop out',
    slug: 'ranked-bars',
    chart: 'FunnelBars',
    instead: 'Ranked bars (a funnel keeps its steps’ order)',
  },
] as const;

const IMPORT_SNIPPET = `import { ChartFrame, LineChart, StatTile } from '@windmorph/react-pro/charts';

<ChartFrame title="Sign-ups" description="The last 12 weeks">
  <LineChart places={weeks} placeLabel="Week" series={[{ key: 'sign-ups', label: 'Sign-ups', values }]} />
</ChartFrame>`;

const THEME_SNIPPET = `import { createTheme, ThemeProvider } from '@windmorph/react';
import { withChartColors } from '@windmorph/react-pro/charts';

// Once, at module scope: making the palettes takes tens of milliseconds a theme.
const brand = withChartColors(createTheme({ name: 'brand', seed: '#0B57D0' }));

<ThemeProvider themes={[brand]} defaultTheme="brand">…</ThemeProvider>`;

const TOKEN_SNIPPET = `/* One series colour for a whole app; set it on a theme or a scope's element instead. */
:root {
  --wm-chart-color-3: oklch(0.62 0.14 150);
}`;

export default async function ChartsPage() {
  const [importHtml, themeHtml, tokenHtml] = await Promise.all([
    highlightSource(IMPORT_SNIPPET, 'tsx'),
    highlightSource(THEME_SNIPPET, 'tsx'),
    highlightSource(TOKEN_SNIPPET, 'css'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Charts</h1>
        <p className={TEXT}>
          A family of charts in Windmorph Pro, <InlineCode>@windmorph/react-pro/charts</InlineCode>,
          on the theme&apos;s colours and springs in every theme, mode and contrast level. Each one
          answers one question, is drawn in the server&apos;s HTML, and can be read by pointer,
          finger, keyboard and screen reader. M3 has no charts, so these follow its colour roles,
          shapes and motion instead of a spec.
        </p>
      </header>

      <section className={SECTION}>
        <h2 id="which-chart" className={HEADING}>
          Which chart for which question
        </h2>
        <p className={TEXT}>
          Start from the question the reader has, then pick the chart that answers it. There is no
          pie or donut: a bar compares amounts more exactly than an angle does. Two measures are two
          charts, never one plot with two value axes.
        </p>
        <table className="w-full border-collapse text-body-medium">
          <thead>
            <tr>
              <th className={HEAD_CELL}>The question</th>
              <th className={HEAD_CELL}>The chart</th>
              <th className={HEAD_CELL}>Rather than</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            {QUESTIONS.map((row) => (
              <tr key={row.question}>
                <td className={CELL}>{row.question}</td>
                <td className={CELL}>
                  <Link href={`/components/${row.slug}`} className="text-primary underline">
                    {row.chart}
                  </Link>
                </td>
                <td className={CELL}>{row.instead}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={TEXT}>
          Put a chart in a{' '}
          <Link href="/components/chart-frame" className="text-primary underline">
            ChartFrame
          </Link>{' '}
          when it needs a title, a switch to a table of the same numbers, or a loading, empty or
          error state.
        </p>
        <CodeBlock code={IMPORT_SNIPPET} html={importHtml} lang="tsx" title="dashboard.tsx" />
      </section>

      <section className={SECTION}>
        <h2 id="installing" className={HEADING}>
          Installing
        </h2>
        <ul className={LIST}>
          <li>
            The charts come with <InlineCode>@windmorph/react-pro</InlineCode> 0.2.10 and need{' '}
            <InlineCode>@windmorph/react</InlineCode> 0.2.10 and <InlineCode>motion</InlineCode>{' '}
            14.12 or later. Only an app that imports <InlineCode>/charts</InlineCode> loads them.
          </li>
          <li>
            Nothing else to import: each chart puts its palette in the page as a style that loads
            once, in the server&apos;s HTML too, so it never flashes the wrong colours.
          </li>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="colours" className={HEADING}>
          Colours
        </h2>
        <ul className={LIST}>
          <li>
            Eight series slots, made for every built-in theme, mode and contrast level. Slot 1 is
            the theme&apos;s primary; the others are picked so that neighbours stay apart for people
            with the common colour-vision deficiencies, and every mark reaches 3:1 against the
            surface it&apos;s drawn on.
          </li>
          <li>
            Series take the slots in order. Give a series a <InlineCode>slot</InlineCode> to pin it,
            so the same thing is the same colour on every chart of a page and keeps its colour when
            others are hidden.
          </li>
          <li>
            An ordered ramp, five steps of slot 1&apos;s hue from lightest to darkest, draws parts
            that follow a scale (a survey&apos;s &quot;never&quot; to &quot;always&quot;):{' '}
            <InlineCode>ordered</InlineCode> on <InlineCode>SegmentedBar</InlineCode> and{' '}
            <InlineCode>SegmentedList</InlineCode>.
          </li>
          <li>
            Colour is never the only key. Every series is named in its legend, readout and table,
            and <InlineCode>texture</InlineCode> adds a hatch per series, on by itself in forced
            colours.
          </li>
          <li>
            A theme made with <InlineCode>createTheme</InlineCode> gets its own palette through{' '}
            <InlineCode>withChartColors</InlineCode>. Without it, its charts use the baseline
            theme&apos;s slots with its own primary.
          </li>
        </ul>
        <CodeBlock code={THEME_SNIPPET} html={themeHtml} lang="tsx" title="theme.tsx" />
        <p className={TEXT}>
          Every slot and step is a token, so an app can set one colour for a whole page, a theme or
          a <InlineCode>ThemeScope</InlineCode>. <InlineCode>chartColor(slot)</InlineCode> gives a
          slot&apos;s colour as a CSS value (
          <InlineCode>
            style={'{{'} background: chartColor(2){' }}'}
          </InlineCode>
          ), for marks of your own beside a chart, such as a key in a sentence.
        </p>
        <CodeBlock code={TOKEN_SNIPPET} html={tokenHtml} lang="css" title="chart-colours.css" />
        <TokenTable set={chartTokenSet} caption="Chart colour tokens" />
      </section>

      <section className={SECTION}>
        <h2 id="reading" className={HEADING}>
          Read by everyone
        </h2>
        <ul className={LIST}>
          <li>
            Every chart has a name: <InlineCode>aria-label</InlineCode>, or a{' '}
            <InlineCode>ChartFrame</InlineCode>&apos;s title.
          </li>
          <li>
            A line or bar chart is one tab stop: a slider over its places, whose arrow keys step
            through them and whose value says each place&apos;s figures in words. The pointer and a
            finger read the nearest place.
          </li>
          <li>
            <InlineCode>ChartFrame</InlineCode>&apos;s table view holds every value, for anyone who
            would rather read numbers than shapes.
          </li>
          <li>
            Figures are formatted in the page&apos;s locale. A missing value (
            <InlineCode>null</InlineCode>) leaves a gap and reads &quot;No value&quot;, never
            nought.
          </li>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="motion" className={HEADING}>
          Motion
        </h2>
        <ul className={LIST}>
          <li>
            A chart draws itself in the first time it comes into view, once, on the theme&apos;s
            springs; a number counts up to its value.
          </li>
          <li>
            When the numbers change, marks move from where they are. Places are matched by name, so
            in a sliding window the kept places slide along and only the new one comes in.
          </li>
          <li>
            Under reduced motion, everything takes its new value at once. See{' '}
            <Link href="/motion" className="text-primary underline">
              Motion
            </Link>
            .
          </li>
        </ul>
      </section>
    </article>
  );
}
