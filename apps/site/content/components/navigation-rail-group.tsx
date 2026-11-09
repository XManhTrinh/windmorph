import type { ComponentDoc } from './doc';
import { navigationRailGroupTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'trigger',
  'triggerIndicator',
  'triggerIcon',
  'triggerLabel',
  'column',
  'columnDivider',
  'columnContent',
  'heading',
  'items',
  'item',
  'itemLabel',
  'itemTrailing',
  'accordion',
];

/** NavigationRailGroup page body: examples, when to use it, behaviour, parts and tokens. */
export async function NavigationRailGroupBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'A pinned current group, and a preview',
      file: 'navigation-rail-group/navigation-rail-group-pinned',
      name: 'NavigationRailGroupPinned',
    },
    {
      title: 'An expanded rail',
      file: 'navigation-rail-group/navigation-rail-group-expanded',
      name: 'NavigationRailGroupExpanded',
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
            A rail destination that opens a secondary column of links, for a site whose sections
            have many pages. It sits directly in a core NavigationRail, beside its items. With a
            handful of destinations, use NavigationRailItem alone.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Collapsed, a group is a real link to <InlineCode>href</InlineCode> or its first item,
              so a press, a middle click, a new tab and no script all work.
            </li>
            <li>
              A mouse or pen rests for <InlineCode>openDelay</InlineCode> to open the column, and
              leaving keeps it for <InlineCode>closeDelay</InlineCode>; a pointer on its way into an
              open column doesn&apos;t switch groups. Keyboard focus opens it at once, and touch
              only navigates.
            </li>
            <li>
              One column is open in a rail. With <InlineCode>pinned</InlineCode>, the current
              group&apos;s column stays open beside the rail and others preview over it; leave room
              for it in your layout with the <InlineCode>column-width</InlineCode> token.
            </li>
            <li>
              The current route comes from <InlineCode>currentPath</InlineCode>, matched by whole
              path segments with the longest match winning. The matching link gets{' '}
              <InlineCode>aria-current=&quot;page&quot;</InlineCode>.
            </li>
            <li>
              In an expanded rail, or its modal sheet, the same group is an accordion. With{' '}
              <InlineCode>hideOnCollapse=&quot;compact&quot;</InlineCode> on the rail, one rail
              serves every window size.
            </li>
            <li>
              Links go through React Aria&apos;s <InlineCode>RouterProvider</InlineCode>, so no
              framework is imported.
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
          Set the tokens below on the group or any ancestor. Its trigger is the core&apos;s
          NavigationRailItem, so the rail&apos;s own tokens paint it. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={navigationRailGroupTokenSet} caption="NavigationRailGroup tokens" />
      </section>
    ),
  };
}
