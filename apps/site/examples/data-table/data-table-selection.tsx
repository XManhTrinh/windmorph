'use client';

import { Button } from '@windmorph/react';
import { DataTable, type ColumnDef, type TableState } from '@windmorph/react-pro';
import { useState } from 'react';

interface Person {
  id: string;
  name: string;
  team: string;
  city: string;
  joined: string;
  salary: number;
}

const PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    team: 'Design',
    city: 'Paris',
    joined: '2021-03-14',
    salary: 72000,
  },
  {
    id: '2',
    name: 'Sam Lee',
    team: 'Engineering',
    city: 'Berlin',
    joined: '2019-11-02',
    salary: 91000,
  },
  {
    id: '3',
    name: 'Priya Nair',
    team: 'Finance',
    city: 'Lyon',
    joined: '2022-06-20',
    salary: 68000,
  },
  {
    id: '4',
    name: 'Zoë Müller',
    team: 'Support',
    city: 'Hamburg',
    joined: '2020-01-09',
    salary: 54000,
  },
  {
    id: '5',
    name: 'Jordan Blake',
    team: 'Design',
    city: 'Zürich',
    joined: '2023-08-30',
    salary: 76000,
  },
  {
    id: '6',
    name: 'Noor Haddad',
    team: 'Engineering',
    city: 'Paris',
    joined: '2018-05-17',
    salary: 99000,
  },
];

const COLUMNS: ColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, grow: true, filter: { kind: 'text' } },
  {
    id: 'team',
    header: 'Team',
    accessor: (row) => row.team,
    filter: {
      kind: 'choice',
      options: ['Design', 'Engineering', 'Finance', 'Support'].map((id) => ({ id, label: id })),
    },
  },
  { id: 'city', header: 'City', accessor: (row) => row.city },
  {
    id: 'joined',
    header: 'Joined',
    accessor: (row) => row.joined,
    type: 'date',
    filter: { kind: 'date' },
  },
  {
    id: 'salary',
    header: 'Salary',
    accessor: (row) => row.salary,
    type: 'currency',
    filter: { kind: 'number' },
  },
];

/** A bulk bar replaces the toolbar while rows are selected; each row has a menu of actions. */
export function DataTableSelection() {
  const [message, setMessage] = useState('');
  const archive = (selection: TableState['selection']) =>
    setMessage(`Archived ${selection.ids.length} people`);
  return (
    <div className="flex w-full flex-col gap-2">
      <DataTable<Person>
        aria-label="People to manage"
        columns={COLUMNS}
        rows={PEOPLE}
        getRowId={(row) => row.id}
        pageSizes={[5, 10]}
        selectionMode="multiple"
        rowSelectable={(row) => row.team !== 'Finance'}
        bulkActions={(selection) => (
          <Button variant="text" onPress={() => archive(selection)}>
            Archive
          </Button>
        )}
        rowActions={(row) => [
          { id: 'email', label: 'Send email', onAction: () => setMessage(`Emailed ${row.name}`) },
          { id: 'remove', label: 'Remove', onAction: () => setMessage(`Removed ${row.name}`) },
        ]}
      />
      <p role="status" className="text-body-medium text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}
