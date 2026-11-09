'use client';

import { DataTable, type ColumnDef, type TableState } from '@windmorph/react-pro';
import { useEffect, useState } from 'react';

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

const TOTAL = 240;

/** Stands in for a request: the app fetches the page, sort and filters the table reports. */
function fetchPage(index: number, size: number): Promise<Person[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Array.from({ length: size }, (_, offset) => {
          const number = index * size + offset;
          return { ...PEOPLE[number % PEOPLE.length]!, id: String(number) };
        }),
      );
    }, 400);
  });
}

/** `mode="server"`: one API, with the app supplying the page and `totalRows`. */
export function DataTableServer() {
  const [state, setState] = useState<TableState>();
  const index = state?.page.index ?? 0;
  const size = state?.page.size ?? 10;
  const requested = `${index}:${size}`;
  const [loaded, setLoaded] = useState<{ key: string; rows: Person[] }>();
  useEffect(() => {
    let current = true;
    void fetchPage(index, size).then((rows) => {
      if (current) setLoaded({ key: `${index}:${size}`, rows });
    });
    return () => {
      current = false;
    };
  }, [index, size]);
  const rows = loaded?.rows ?? [];
  const loading = loaded?.key !== requested;
  return (
    <div className="w-full">
      <DataTable<Person>
        aria-label="All people"
        mode="server"
        totalRows={TOTAL}
        columns={COLUMNS}
        rows={rows}
        getRowId={(row) => row.id}
        pageSizes={[10, 25]}
        selectionMode="multiple"
        loading={loading}
        onStateChange={setState}
      />
    </div>
  );
}
