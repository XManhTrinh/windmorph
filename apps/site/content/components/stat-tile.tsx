import type { ComponentDoc } from './doc';
import { sparklineTokenSet, statTileTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['label', 'figure', 'value', 'unit', 'change', 'changeIcon', 'trend'];
const SPARKLINE_SLOTS = ['trend', 'point'];

/** StatTile page body: examples, when to use it, behaviour, parts and tokens. */
export async function StatTileBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'A row of tiles on a dashboard',
      file: 'stat-tile/stat-tile-dashboard',
      name: 'StatTileDashboard',
    },
    {
      title: 'A large figure, a unit, and no value yet',
      file: 'stat-tile/stat-tile-sizes',
      name: 'StatTileSizes',
    },
    {
      title: 'A new period, and a trend on its own',
      file: 'stat-tile/stat-tile-trend',
      name: 'StatTileTrend',
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
            One number and how it moved, for a dashboard or a summary: what the number is, the
            figure, its change against something, and a small trend under it. Where a chart with a
            single bar would make the reader work it out, the tile says it.
          </p>
          <p className={TEXT}>
            M3 has no chart components, so the tile follows M3&apos;s colour roles, type scale and
            springs instead of a spec. For an amount against a limit, such as storage used or seats
            taken, use a Meter; to show in detail how something changed over time, with axes and a
            readout, a Line chart; to compare a few figures with each other, Ranked bars.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>label</InlineCode> says what the number is and names the tile, a group.{' '}
              <InlineCode>formatValue</InlineCode> writes <InlineCode>value</InlineCode>; by default
              it is in the nearest <InlineCode>LocaleProvider</InlineCode>&apos;s locale, else the
              browser&apos;s, with up to two decimals. <InlineCode>unit</InlineCode> sits smaller
              beside the number (&quot;min&quot;), so a long unit never wraps the number.
            </li>
            <li>
              The number counts up from 0 the first time the tile comes into view, then springs from
              the figure showing to each new value, never past it. Its box keeps the final
              figure&apos;s width as it counts, so nothing beside it moves. A tile on screen as the
              page loads shows its final number from the server&apos;s HTML, with no count.
            </li>
            <li>
              A value that isn&apos;t a finite number, such as a figure still loading or a share of
              nothing, reads <InlineCode>labels.noValue</InlineCode> (&quot;No value&quot;), never
              &quot;NaN&quot;.
            </li>
            <li>
              <InlineCode>change</InlineCode> says how the number moved:{' '}
              <InlineCode>direction</InlineCode> picks the arrow, and <InlineCode>value</InlineCode>{' '}
              and <InlineCode>context</InlineCode> are your own words (&quot;12%&quot;, &quot;on
              last week&quot;). <InlineCode>tone</InlineCode> says whether it is good news:{' '}
              <InlineCode>good</InlineCode> is in the <InlineCode>success</InlineCode> colour,{' '}
              <InlineCode>bad</InlineCode> in <InlineCode>error</InlineCode>, and{' '}
              <InlineCode>neutral</InlineCode>, the default, stays quiet. Direction and tone are
              separate, since a rise in returns is bad news. <InlineCode>icons</InlineCode> replaces
              the arrows.
            </li>
            <li>
              <InlineCode>trend</InlineCode> takes the number&apos;s recent values, oldest first,
              and draws them as a <InlineCode>Sparkline</InlineCode> under the number: in the quiet
              colour, with a dot in the first series colour on the newest. About 12 values read
              best; average a longer run first.
            </li>
            <li>
              A sparkline is drawn over its values&apos; own range rather than from 0, so its shape
              reads at a small size; a run that moves less than a tenth of its level keeps that
              tenth, so a nearly flat figure stays nearly flat. Values that aren&apos;t numbers are
              left out. Time runs from the start edge, so right to left the newest value is on the
              left.
            </li>
            <li>
              Inside a tile the sparkline is decorative. On its own, beside the words it stands for,
              name it with <InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode> and it becomes an image for screen readers.
              New values spring into their shape while it is on screen, and land at once off screen.
            </li>
            <li>
              <InlineCode>size</InlineCode> is <InlineCode>md</InlineCode> (the default, for a row
              of tiles) or <InlineCode>lg</InlineCode>, for the one figure a page is about. The tile
              draws no container: put it on a card for one.
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
          Set the tokens below on the tile or any ancestor. The trend&apos;s line, its end dot and
          the dot&apos;s ring come from the shared chart tokens (
          <InlineCode>--wm-chart-quiet</InlineCode>, <InlineCode>--wm-chart-color-1</InlineCode> and{' '}
          <InlineCode>--wm-chart-surface</InlineCode>); on a card of another colour than{' '}
          <InlineCode>surface</InlineCode>, set <InlineCode>--wm-chart-surface</InlineCode> to it so
          the ring matches. <InlineCode>className</InlineCode> goes on the root; style each part
          with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />, where{' '}
          <InlineCode>trend</InlineCode> goes on the sparkline&apos;s root. A{' '}
          <InlineCode>Sparkline</InlineCode> of your own takes <InlineCode>className</InlineCode> on
          its root and <InlineCode>classNames</InlineCode> for its line and end dot:{' '}
          <CodeList names={SPARKLINE_SLOTS} />.
        </p>
        <TokenTable set={statTileTokenSet} caption="StatTile tokens" />
        <TokenTable set={sparklineTokenSet} caption="Sparkline tokens" />
      </section>
    ),
  };
}
