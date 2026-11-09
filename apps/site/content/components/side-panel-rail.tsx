import type { ComponentDoc } from './doc';
import { sidePanelRailTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'clip', 'items', 'item', 'indicator', 'tab', 'toggle', 'chevron'];

/** SidePanelRail page body: examples, when to use it, behaviour, parts and tokens. */
export async function SidePanelRailBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Links and buttons',
      file: 'side-panel-rail/side-panel-rail-basic',
      name: 'SidePanelRailBasic',
    },
    {
      title: 'Opening a standard side sheet',
      file: 'side-panel-rail/side-panel-rail-with-sheet',
      name: 'SidePanelRailWithSheet',
    },
    {
      title: 'Controlled by the app',
      file: 'side-panel-rail/side-panel-rail-controlled',
      name: 'SidePanelRailControlled',
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
            A narrow strip of icon links or buttons at the end edge of the window, for secondary
            destinations and tools that aren&apos;t the app&apos;s main navigation. For primary
            destinations, use a NavigationRail.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              An item with <InlineCode>href</InlineCode> is a link; with{' '}
              <InlineCode>onPress</InlineCode> it&apos;s a button, which can open a standard
              SideSheet.
            </li>
            <li>
              Hidden, the strip closes to a 16px gutter and the page gets the room back. The toggle
              becomes a tab on the window&apos;s edge, wider under a pointer and 48px on a touch
              screen.
            </li>
            <li>
              It stores nothing. To remember the state, control <InlineCode>open</InlineCode>, and
              pass a saved value from the server as <InlineCode>defaultOpen</InlineCode> to avoid a
              flash on first paint.
            </li>
            <li>
              Below <InlineCode>hideBelow</InlineCode> (<InlineCode>medium</InlineCode> by default)
              the strip isn&apos;t shown, so put those destinations in the app&apos;s drawer.
            </li>
            <li>
              <InlineCode>selected</InlineCode> marks the current page or the item whose sheet is
              open.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="beside-a-side-sheet" className={HEADING}>
            Beside a side sheet
          </h2>
          <p className={TEXT}>
            Place a <InlineCode>variant=&quot;standard&quot;</InlineCode> SideSheet between the page
            and the strip. With <InlineCode>detached</InlineCode> it&apos;s a rounded card, and{' '}
            <InlineCode>classNames.frame</InlineCode> removes its margin on the strip&apos;s side.
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
          Set the tokens below on the strip or any ancestor. Its items and toggle keep the
          IconButton&apos;s own tokens. Style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={sidePanelRailTokenSet} caption="SidePanelRail tokens" />
      </section>
    ),
  };
}
