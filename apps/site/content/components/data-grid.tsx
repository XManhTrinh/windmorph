import type { ComponentDoc } from './doc';
import { dataGridTokenSet } from '@windmorph/react-pro/data-grid';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'scroller',
  'header',
  'headerRow',
  'headerCell',
  'rowHeaderCell',
  'body',
  'row',
  'cell',
  'editor',
  'invalidIcon',
  'summaryRow',
  'summaryCell',
  'status',
  'loading',
  'empty',
  'error',
];

/** DataGrid page body: examples, when to use it, behaviour, parts and tokens. */
export async function DataGridBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Editing, validation and a pinned column',
      file: 'data-grid/data-grid-editing',
      name: 'DataGridEditing',
    },
    {
      title: 'A row header, totals and cell states',
      file: 'data-grid/data-grid-summary',
      name: 'DataGridSummary',
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
            Edit records cell by cell, as in a spreadsheet, across rows and columns virtualized both
            ways. Import it from <InlineCode>@windmorph/react-pro/data-grid</InlineCode>, with{' '}
            <InlineCode>@tanstack/react-virtual</InlineCode> installed. To browse and act on rows
            instead, use a DataTable.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              One tab stop: arrows, Page Up, Page Down, Home, End and Ctrl + Home or End move, and
              the active cell stays mounted when it scrolls away.
            </li>
            <li>
              Enter, F2 or typing edits. Enter and Tab commit and move, Escape cancels, and Delete
              clears the range.
            </li>
            <li>
              <InlineCode>validate</InlineCode> returns a message. The cell keeps what was typed, is
              marked invalid with an icon as well as colour, and shows the message below the grid;{' '}
              <InlineCode>onCellChange</InlineCode> isn&apos;t called.
            </li>
            <li>
              Editors are <InlineCode>text</InlineCode>, <InlineCode>number</InlineCode> (with{' '}
              <InlineCode>min</InlineCode> and <InlineCode>max</InlineCode>),{' '}
              <InlineCode>select</InlineCode> and <InlineCode>custom</InlineCode>, on each
              column&apos;s <InlineCode>editor</InlineCode>.
            </li>
            <li>
              Shift with movement, or a mouse drag, selects a range. Copy and paste use
              tab-separated text, so they work with spreadsheets; <InlineCode>onPaste</InlineCode>{' '}
              can reject or adjust a paste.
            </li>
            <li>
              <InlineCode>getCellState</InlineCode> gives a cell a semantic state with a label, so
              colour is never alone. <InlineCode>summaryRows</InlineCode> are the app&apos;s: the
              grid never computes totals.
            </li>
            <li>
              Rows and columns are placed from the <InlineCode>row-height</InlineCode>,{' '}
              <InlineCode>header-height</InlineCode> and <InlineCode>row-header-width</InlineCode>{' '}
              tokens, and follow a change to them, a theme switch or density.
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
          Set the tokens below on the grid or any ancestor. Its editors are the core&apos;s fields,
          which keep their own tokens. Style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={dataGridTokenSet} caption="DataGrid tokens" />
      </section>
    ),
  };
}
