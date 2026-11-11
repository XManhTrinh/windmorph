'use client';

import { DataTable, type ColumnDef } from '@windmorph/react-pro';

interface Office {
  id: string;
  name: string;
  country: string;
  role: string;
  opened: string;
}

const OFFICES: Office[] = [
  {
    id: '1',
    name: 'Riverside',
    country: 'United Kingdom',
    role: 'Headquarters',
    opened: '2014-04-02',
  },
  { id: '2', name: 'Altstadt', country: 'Deutschland', role: 'Engineering', opened: '2017-09-18' },
  { id: '3', name: 'Lakeview', country: 'Schweiz', role: 'Research', opened: '2019-01-07' },
  { id: '4', name: 'Old Harbour', country: 'Netherlands', role: 'Support', opened: '2021-06-21' },
  { id: '5', name: 'Montmartre', country: 'France', role: 'Design', opened: '2023-03-13' },
];

/*
 * Fixed widths for values of a steady length (dates, amounts, ids), `'fit'` for text whose
 * length follows the data or the language, and `grow` for the column that takes the spare
 * width (a fit column that grows is never narrower than its content).
 */
const COLUMNS: ColumnDef<Office>[] = [
  { id: 'name', header: 'Office', accessor: (row) => row.name, width: 'fit', grow: true },
  { id: 'country', header: 'Country', accessor: (row) => row.country, width: 'fit' },
  { id: 'role', header: 'Role', accessor: (row) => row.role, width: 'fit' },
  { id: 'opened', header: 'Opened', accessor: (row) => row.opened, type: 'date', width: 140 },
];

/**
 * Column widths: a fit column takes the widest of its header and values, so a long or
 * translated value is never cut short. Drag a header's edge to resize it; a double-click on the
 * edge, or R then Enter on the header, fits any column, and Reset in column settings brings
 * fit back.
 */
export function DataTableWidths() {
  return (
    <div className="w-full">
      <DataTable<Office>
        aria-label="Offices"
        columns={COLUMNS}
        rows={OFFICES}
        getRowId={(row) => row.id}
        compactBelow={false}
      />
    </div>
  );
}
