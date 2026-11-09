import type { ComponentDoc } from './doc';
import { treeViewTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'row',
  'content',
  'expandButton',
  'expandIcon',
  'checkbox',
  'leading',
  'text',
  'title',
  'supportingText',
  'trailing',
  'loadingRow',
  'errorRow',
];

/** TreeView page body: examples, when to use it, behaviour, parts and tokens. */
export async function TreeViewBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Selection, with a disabled row',
      file: 'tree-view/tree-view-selection',
      name: 'TreeViewSelection',
    },
    { title: "A row's own controls", file: 'tree-view/tree-view-actions', name: 'TreeViewActions' },
    { title: 'Children that load', file: 'tree-view/tree-view-loading', name: 'TreeViewLoading' },
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
            A hierarchy of rows that open and fold, each with optional selection and its own
            controls: folders, organisation units, categories. For a flat set, use a List.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              It follows the tree grid pattern: Up, Down, Home, End and typing move between rows,
              and Left and Right close, open and move into a row&apos;s controls.
            </li>
            <li>
              <InlineCode>items</InlineCode> are data, and <InlineCode>children</InlineCode> renders
              each one, usually as a <InlineCode>TreeViewItemContent</InlineCode>.
            </li>
            <li>
              <InlineCode>hasChildren</InlineCode> marks a row whose children aren&apos;t loaded.{' '}
              <InlineCode>onLoadChildren</InlineCode> returns a promise; a loading row shows, and a
              failure shows a row with a retry.
            </li>
            <li>
              A disabled row can&apos;t be selected or activated, and stays reachable by keyboard.
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
          Set the tokens below on the tree or any ancestor. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={treeViewTokenSet} caption="TreeView tokens" />
      </section>
    ),
  };
}
