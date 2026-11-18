'use client';

import { DataTable, type ColumnDef } from '@windmorph/react-pro';

interface Reading {
  hour: number;
  temperature: number;
  humidity: number;
  wind: number;
}

/** A weather station's readings, one an hour through a day. */
const READINGS: Reading[] = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  temperature: Math.round((11 + 7 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)) * 10) / 10,
  humidity: Math.round(72 - 18 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)),
  wind: Math.round((9 + 5 * Math.sin((hour / 24) * 4 * Math.PI)) * 10) / 10,
}));

const COLUMNS: ColumnDef<Reading>[] = [
  {
    id: 'hour',
    header: 'Time',
    accessor: (row) => row.hour,
    format: (hour) => `${String(hour).padStart(2, '0')}:00`,
    rowHeader: true,
  },
  {
    id: 'temperature',
    header: 'Temperature',
    accessor: (row) => row.temperature,
    type: 'number',
    format: (value) => `${String(value)} °C`,
  },
  {
    id: 'humidity',
    header: 'Humidity',
    accessor: (row) => row.humidity,
    type: 'number',
    format: (value) => `${String(value)}%`,
  },
  {
    id: 'wind',
    header: 'Wind',
    accessor: (row) => row.wind,
    type: 'number',
    format: (value) => `${String(value)} km/h`,
  },
];

/**
 * `maxHeight`: past 320px the rows scroll under the header. A plain table's scroller takes a tab
 * stop while it cuts rows off, so the keyboard can scroll it; in a narrow window the list shows
 * every reading with its column's name.
 */
export function DataTableHeight() {
  return (
    <div className="w-full">
      <DataTable<Reading>
        plain
        aria-label="Readings through the day"
        columns={COLUMNS}
        rows={READINGS}
        getRowId={(row) => String(row.hour)}
        maxHeight={320}
      />
    </div>
  );
}
