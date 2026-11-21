import type { ComponentDoc } from './doc';
import { reorderListTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'item', 'handle', 'content', 'dropZone', 'menu'];

/** ReorderList page body: examples, when to use it, the three ways to move, and tokens. */
export async function ReorderListBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Steps put in order',
      file: 'reorder-list/reorder-list-steps',
      name: 'ReorderListSteps',
    },
    {
      title: "A row's own menu, a fixed row and the handle at the end",
      file: 'reorder-list/reorder-list-own-menu',
      name: 'ReorderListOwnMenu',
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
            A vertical list whose rows a person puts in order, for any list whose order is the
            content: episodes, recipe steps, a playlist, a profile&apos;s links, a table&apos;s
            columns. Each row holds your own content beside a handle.
          </p>
          <p className={TEXT}>
            M3 defines a list item&apos;s dragged look, which this list takes; the drag itself runs
            on the core&apos;s <InlineCode>useReorder</InlineCode> engine (in{' '}
            <InlineCode>@windmorph/react/primitives</InlineCode>). Use the core{' '}
            <InlineCode>List</InlineCode> for rows that are picked rather than ordered, and a{' '}
            <InlineCode>MediaUploadGrid</InlineCode> to order photos being uploaded. Moving a row to
            another list stays a menu item of your own.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="moving-a-row" className={HEADING}>
            Moving a row
          </h2>
          <ul className={LIST}>
            <li>
              <strong>Dragging</strong> the handle with a mouse, a finger or a pen: past 4px the row
              lifts in M3&apos;s dragged look (<InlineCode>tertiary-container</InlineCode>, level 4
              elevation, 16px corners) and follows the pointer along the list; the rows it passes
              slide out of its way, and where it will land shows as the drop zone. Near the edge of
              a scrolling parent, or the window, the list scrolls. Escape, a cancelled pointer, the
              window losing focus, or the items changing put the row back.
            </li>
            <li>
              <strong>The keys</strong> on the focused handle: Up and Down move the row one place,
              Home and End to the top and bottom, at once.
            </li>
            <li>
              <strong>The move menu:</strong> a press on the handle that doesn&apos;t drag opens
              Move up, Move down, Move to top and Move to bottom, so nothing needs a drag (WCAG
              2.5.7). A row with a menu of its own turns it off with{' '}
              <InlineCode>moveMenu=&#123;false&#125;</InlineCode> and moves through{' '}
              <InlineCode>useReorderListItem()</InlineCode> inside the row (
              <InlineCode>moveUp</InlineCode>, <InlineCode>moveDown</InlineCode>,{' '}
              <InlineCode>moveToTop</InlineCode>, <InlineCode>moveToBottom</InlineCode>,{' '}
              <InlineCode>canMoveUp</InlineCode>, <InlineCode>canMoveDown</InlineCode>); give every
              row such a menu then, or keyboard and screen-reader users have no way to move it (a
              development warning says so when no row uses the hook).
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              The order is yours (controlled only): <InlineCode>onReorder(keys, move)</InlineCode>{' '}
              is called once a move lands, with every key in the new order and the{' '}
              <InlineCode>&#123; key, from, to &#125;</InlineCode> of the move. Keys come back as
              strings, as React keeps them (a key <InlineCode>7</InlineCode> is{' '}
              <InlineCode>&quot;7&quot;</InlineCode>). Give the old order back to refuse it, and the
              row slides back.
            </li>
            <li>
              A key repeated across arrays or fragments still works: each row keeps its own place
              and <InlineCode>onReorder</InlineCode> gives back the keys as written, while a
              development warning names the repeated key so the app can make it unique.
            </li>
            <li>
              Focus stays with the moved row&apos;s handle (or your own control in it) and the row
              stays in view. A row that leaves while focus is in it hands focus to the row that took
              its place, else the one before, else the list.
            </li>
            <li>
              A row with <InlineCode>reorderable=&#123;false&#125;</InlineCode> has no handle, keeps
              its column, and keeps its place: no row moves past it. A list of one row has no handle
              either. <InlineCode>disabled</InlineCode> keeps the handles, disabled, so nothing
              shifts while you save.
            </li>
            <li>
              <InlineCode>handlePlacement=&quot;end&quot;</InlineCode> puts the handle at the
              row&apos;s end. The lifted row carries <InlineCode>data-dragged</InlineCode>, and rows
              of a disabled list <InlineCode>data-disabled</InlineCode>.
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
          Set the tokens below on the list or any ancestor: the dragged row&apos;s colours,
          elevation and corner, the drop zone, the handle&apos;s size, icon and colour, the
          auto-scroll edge and the motion. The handle is a 48px round core{' '}
          <InlineCode>IconButton</InlineCode> that follows density, and the move menu the core{' '}
          <InlineCode>Menu</InlineCode>, themed by their own tokens.{' '}
          <InlineCode>className</InlineCode> and <InlineCode>aria-*</InlineCode> go on the list;
          style each part with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={reorderListTokenSet} caption="ReorderList tokens" />
      </section>
    ),
  };
}
