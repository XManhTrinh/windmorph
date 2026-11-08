'use client';

import { DataGrid, type DataGridColumn } from '@windmorph/react-pro/data-grid';

interface Line {
  id: string;
  item: string;
  team: string;
  q1: number;
  q2: number;
  q3: number;
}

const TEAMS = ['Design', 'Engineering', 'Finance', 'Support'];

const LINES: Line[] = Array.from({ length: 40 }, (_, index) => ({
  id: String(index),
  item: `Line ${index + 1}`,
  team: TEAMS[index % TEAMS.length]!,
  q1: 1000 + index * 12,
  q2: 1200 + index * 7,
  q3: 900 + index * 16,
}));

const quarter = (id: 'q1' | 'q2' | 'q3'): DataGridColumn<Line> => ({
  id,
  header: id.toUpperCase(),
  accessor: (row) => row[id],
  type: 'number',
  validate: (value) =>
    typeof value === 'number' && value < 0 ? 'A budget can’t be negative' : null,
});

const COLUMNS: DataGridColumn<Line>[] = [
  { id: 'item', header: 'Item', accessor: (row) => row.item, pinned: 'start', width: 160 },
  {
    id: 'team',
    header: 'Team',
    accessor: (row) => row.team,
    editor: { kind: 'select', options: TEAMS.map((id) => ({ id, label: id })) },
  },
  quarter('q1'),
  quarter('q2'),
  quarter('q3'),
];

/** A row header, the app's totals, and a cell state with a label as well as a colour. */
export function DataGridSummary() {
  const total = (id: 'q1' | 'q2' | 'q3') =>
    LINES.reduce((sum, row) => sum + row[id], 0).toLocaleString('en');
  return (
    <div className="w-full">
      <DataGrid<Line>
        aria-label="Budget with totals"
        columns={COLUMNS}
        rows={LINES}
        getRowId={(row) => row.id}
        height={360}
        rowHeader={(_, index) => index + 1}
        getCellState={(row, column) =>
          column.id === 'q2' && row.q2 > 1400 ? { state: 'warning', label: 'Over budget' } : null
        }
        summaryRows={[
          {
            id: 'total',
            label: 'Σ',
            values: { q1: total('q1'), q2: total('q2'), q3: total('q3') },
          },
        ]}
      />
    </div>
  );
}
