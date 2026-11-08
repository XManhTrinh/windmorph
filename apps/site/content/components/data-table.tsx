import type { ComponentDoc } from './doc';
import { dataTableTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'toolbar',
  'search',
  'filterButton',
  'actions',
  'columnsButton',
  'bulkBar',
  'bulkCount',
  'bulkActions',
  'chips',
  'chip',
  'clearAll',
  'container',
  'table',
  'header',
  'headerRow',
  'headerCell',
  'sortIcon',
  'sortLevel',
  'resizer',
  'body',
  'row',
  'cell',
  'rowLink',
  'selectionCell',
  'actionsCell',
  'pagination',
  'pageSize',
  'range',
  'pageButtons',
  'compactList',
  'compactRow',
  'loading',
  'skeletonRow',
  'progress',
  'empty',
  'error',
  'columnSettings',
  'filterDialog',
];

/** DataTable page body: examples, when to use it, behaviour, parts and tokens. */
export async function DataTableBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Search, sort, filter, columns and pages',
      file: 'data-table/data-table-tools',
      name: 'DataTableTools',
    },
    {
      title: 'Selection, a bulk bar and row actions',
      file: 'data-table/data-table-selection',
      name: 'DataTableSelection',
    },
    { title: 'Data from a server', file: 'data-table/data-table-server', name: 'DataTableServer' },
    { title: 'Pinned columns', file: 'data-table/data-table-pinned', name: 'DataTablePinned' },
    { title: 'A plain table', file: 'data-table/data-table-plain', name: 'DataTablePlain' },
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
            Browse, sort, filter, select and act on records, comparing them across columns. Use{' '}
            <InlineCode>plain</InlineCode> for a short read-only table, a DataGrid to edit cell by
            cell, and a List for items with a single column.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Everything a person changes is one serializable <InlineCode>TableState</InlineCode>:
              order, hidden columns, widths, pins, sort, filters, search, page and selection. Pass{' '}
              <InlineCode>state</InlineCode> and <InlineCode>onStateChange</InlineCode> to save a
              view, and <InlineCode>repairTableState</InlineCode> to check a saved one against
              today&apos;s columns.
            </li>
            <li>
              <InlineCode>mode=&quot;client&quot;</InlineCode> sorts, filters and pages the array,
              up to about 5,000 rows. <InlineCode>mode=&quot;server&quot;</InlineCode> reports the
              state and takes one page and <InlineCode>totalRows</InlineCode>; the row counts stay
              true for assistive technology.
            </li>
            <li>
              A press on a header cycles ascending, descending and none. Shift adds a level, up to{' '}
              <InlineCode>maxSortLevels</InlineCode>, and each change is announced.
            </li>
            <li>
              Columns resize by dragging, or from the keyboard with R on a focused header. They
              reorder by dragging a header, or in column settings, which also shows, hides and pins
              them.
            </li>
            <li>
              A selection survives page changes and clears when the search or filters change the
              set. In server mode the bulk bar offers every matching row, through{' '}
              <InlineCode>selection.allMatching</InlineCode>.
            </li>
            <li>
              Below <InlineCode>compactBelow</InlineCode> of its own width the table becomes a list,
              through a container query, so the server&apos;s HTML is right.{' '}
              <InlineCode>renderCompactRow</InlineCode> chooses what each row shows, and selection
              and actions carry over.
            </li>
            <li>
              <InlineCode>useDataTable</InlineCode> and the <InlineCode>DataTable*</InlineCode>{' '}
              parts compose the same pieces differently: pass the hook&apos;s result to each part as{' '}
              <InlineCode>table</InlineCode>.
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
          Set the tokens below on the table or any ancestor. Its fields, buttons and menus are the
          core&apos;s, so they keep their own tokens. Style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={dataTableTokenSet} caption="DataTable tokens" />
      </section>
    ),
  };
}
