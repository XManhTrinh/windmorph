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
    { title: 'Column widths', file: 'data-table/data-table-widths', name: 'DataTableWidths' },
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
          <h2 id="column-widths" className={HEADING}>
            Column widths
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>width: 180</InlineCode> (a number, the default) for values of a known,
              steady length: dates, amounts, ids, a status chip.
            </li>
            <li>
              <InlineCode>width: &apos;fit&apos;</InlineCode> for text whose length follows the data
              or the language: names, places, labels. The column takes the widest of its header and
              values, within <InlineCode>minWidth</InlineCode> (80 by default) and{' '}
              <InlineCode>maxWidth</InlineCode>, so a translated value isn&apos;t cut short.
            </li>
            <li>
              <InlineCode>grow</InlineCode>, with either, for the column that takes the table&apos;s
              spare width, usually the main text column. A fit column that grows is never narrower
              than its content.
            </li>
            <li>
              A person&apos;s resize wins: their width is saved in{' '}
              <InlineCode>state.widths</InlineCode> and fit stops for that column. Reset in column
              settings, or a double-click on its edge, brings fit back.
            </li>
            <li>
              Client mode measures every row&apos;s value, so the widths stay put as people page,
              sort and search; server mode fits the rows on the page. A column with its own{' '}
              <InlineCode>cell</InlineCode> fits the cells shown, so a cell that wraps or grows with
              its box (several tags, a progress bar) should take a number instead.
            </li>
            <li>
              The server&apos;s HTML gives a fit column 180px until the browser measures it, once it
              shows and once the page&apos;s fonts load. A DataGrid&apos;s columns take numbers: it
              renders only the rows in view, so it can&apos;t measure the rest.
            </li>
          </ul>
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
              Columns resize by dragging, or from the keyboard with R on a focused header. A
              double-click on a column&apos;s edge, or R then Enter, fits it to its content. They
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
