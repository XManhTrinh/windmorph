'use client';

import { DataGrid, type DataGridColumn } from '@windmorph/react-pro/data-grid';
import { useState } from 'react';

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

/** Enter, F2 or typing edits; Tab and Enter commit and move; a bad value is kept and marked. */
export function DataGridEditing() {
  const [rows, setRows] = useState(LINES);
  return (
    <div className="w-full">
      <DataGrid<Line>
        aria-label="Budget"
        columns={COLUMNS}
        rows={rows}
        getRowId={(row) => row.id}
        editable
        height={360}
        onCellChange={({ rowId, columnId, value }) =>
          setRows((current) =>
            current.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)),
          )
        }
      />
    </div>
  );
}
