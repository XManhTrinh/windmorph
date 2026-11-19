import type { ComponentDoc } from './doc';
import { meterTokenSet } from '@windmorph/react-pro/charts';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'label',
  'meter',
  'figure',
  'value',
  'limit',
  'track',
  'fill',
  'notch',
  'note',
  'status',
  'statusIcon',
];
const LIST_SLOTS = ['list', 'row', 'name'];

/** Meter page body: examples, when to use it, behaviour, parts and tokens. */
export async function MeterBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Storage: fine, close to the limit, and over it',
      file: 'meter/meter-storage',
      name: 'MeterStorage',
    },
    { title: 'Plan limits, each against its own', file: 'meter/meter-limits', name: 'MeterLimits' },
    { title: 'A new amount', file: 'meter/meter-changing', name: 'MeterChanging' },
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
            One amount against a known limit: storage used, seats taken, a month&apos;s minutes. The
            amount is the headline, the limit sits beside it, a track shows the share, and a line
            under it can say what is left. Near the limit and past it, the meter says so in words
            with a mark, never by colour alone. A pie of two slices would say less. A{' '}
            <InlineCode>MeterList</InlineCode> shows several amounts, each against its own limit.
          </p>
          <p className={TEXT}>
            M3 has no meter or chart components, so this one follows M3&apos;s colour roles, shapes
            and springs instead of a spec. For how far a task has got, such as an upload, use a
            Progress indicator: it reports work under way, where a meter reports a level. For one
            whole split into a few parts, use a Segmented bar; to let people choose a number, a
            Slider.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>value</InlineCode> is measured against <InlineCode>max</InlineCode>, the
              limit, from <InlineCode>min</InlineCode> (0 by default).{' '}
              <InlineCode>formatValue</InlineCode> writes the amount and the limit, by default in
              the nearest <InlineCode>LocaleProvider</InlineCode>&apos;s locale, else the
              browser&apos;s; give it the unit (&quot;75.6 GB&quot;), since screen readers hear the
              same words. The limit shows as <InlineCode>labels.of</InlineCode> (&quot;of 100
              GB&quot;).
            </li>
            <li>
              From <InlineCode>warningAt</InlineCode> the meter is in its warning state: the fill
              takes the warning colour and the line under the track says{' '}
              <InlineCode>labels.near</InlineCode> (&quot;Close to the limit&quot;) with a mark. A
              notch in the track marks where it starts. Past <InlineCode>max</InlineCode> it is
              critical, in the error colour, with <InlineCode>labels.over</InlineCode> (&quot;Over
              the limit&quot;); the track stays full and the figure keeps the real amount. A warning
              point outside the range is ignored. <InlineCode>data-state</InlineCode> on the root
              (on each row, in a list) is <InlineCode>fine</InlineCode>,{' '}
              <InlineCode>warning</InlineCode> or <InlineCode>critical</InlineCode>.
            </li>
            <li>
              <InlineCode>note</InlineCode> goes under the track, after the state&apos;s words, in
              your own words: what is left (&quot;24.4 GB left&quot;), or what to do. That line is
              kept even while it is empty, on every meter and every{' '}
              <InlineCode>MeterList</InlineCode> row, with a <InlineCode>warningAt</InlineCode> or
              without, since any amount can pass its limit: the state&apos;s words appear without
              moving what is below.
            </li>
            <li>
              The fill grows from the start the first time the meter comes into view, while the
              number counts up from <InlineCode>min</InlineCode>; a new amount moves both from where
              they are. A meter on screen as the page loads shows its final picture from the
              server&apos;s HTML, with nothing replayed. Under reduced motion the meter shows its
              final picture at once, wherever it is on the page.
            </li>
            <li>
              An amount or a limit that isn&apos;t a number reads{' '}
              <InlineCode>labels.noValue</InlineCode> (&quot;No value&quot;) and draws an empty
              track, never &quot;NaN&quot;. <InlineCode>icons</InlineCode> replaces the warning and
              critical marks.
            </li>
            <li>
              <InlineCode>MeterList</InlineCode> takes <InlineCode>rows</InlineCode> of{' '}
              <InlineCode>key</InlineCode>, <InlineCode>label</InlineCode>,{' '}
              <InlineCode>value</InlineCode>, <InlineCode>max</InlineCode>, and optionally{' '}
              <InlineCode>min</InlineCode>, <InlineCode>warningAt</InlineCode> and{' '}
              <InlineCode>note</InlineCode>; each row warns as a meter does. Names, tracks and
              figures are three columns of one grid, so every track lines up, and the names&apos;
              column takes at most 12rem. In a container narrower than 28rem each track drops under
              its name, so the list fits a side panel. Keep each row&apos;s{' '}
              <InlineCode>key</InlineCode> as its amount changes; a development build warns when two
              rows share one, or when a row&apos;s <InlineCode>min</InlineCode> is above its{' '}
              <InlineCode>max</InlineCode>, as it does for a meter.
            </li>
            <li>
              Name a <InlineCode>MeterList</InlineCode> with <InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode>, or put it in a Chart frame, whose title
              names it; a development build warns about a list with neither.
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
          Set the tokens below on the meter, the list or any ancestor; a{' '}
          <InlineCode>MeterList</InlineCode> reads the same set, with three tokens of its own (
          <InlineCode>column-gap</InlineCode>, <InlineCode>list-figure-gap</InlineCode> and{' '}
          <InlineCode>name-width</InlineCode>). The fill and the marks take the shared chart tokens:{' '}
          <InlineCode>--wm-chart-color-1</InlineCode> while fine,{' '}
          <InlineCode>--wm-chart-warning</InlineCode> and{' '}
          <InlineCode>--wm-chart-critical</InlineCode> past <InlineCode>warningAt</InlineCode> and{' '}
          <InlineCode>max</InlineCode>. The track and the notch are drawn from{' '}
          <InlineCode>--wm-chart-surface</InlineCode>: on a card of another colour than{' '}
          <InlineCode>surface</InlineCode>, set it to the card&apos;s.{' '}
          <InlineCode>className</InlineCode> goes on the root; style a meter&apos;s parts with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />. A{' '}
          <InlineCode>MeterList</InlineCode>&apos;s <InlineCode>classNames</InlineCode> take each
          row&apos;s parts too, with <CodeList names={LIST_SLOTS} /> in place of{' '}
          <InlineCode>label</InlineCode>.
        </p>
        <TokenTable set={meterTokenSet} caption="Meter tokens" />
      </section>
    ),
  };
}
