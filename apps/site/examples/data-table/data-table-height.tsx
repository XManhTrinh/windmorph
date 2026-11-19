'use client';

import { useLocale } from '@windmorph/react';
import { DataTable, type ColumnDef } from '@windmorph/react-pro';
import { useMemo } from 'react';

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

/**
 * `maxHeight`: past 320px the rows scroll under the header. A plain table's scroller takes a tab
 * stop while it cuts rows off, so the keyboard can scroll it; where the table itself is narrow the list shows
 * every reading with its column's name. Each column's `format` writes its times and units in
 * the page's locale.
 */
export function DataTableHeight() {
  const { locale } = useLocale();
  const columns = useMemo<ColumnDef<Reading>[]>(() => {
    // The hour on a fixed day in UTC, so the server and the browser write the same time.
    const time = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    });
    const celsius = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'celsius',
      maximumFractionDigits: 1,
    });
    const percent = new Intl.NumberFormat(locale, { style: 'unit', unit: 'percent' });
    const speed = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'kilometer-per-hour',
      maximumFractionDigits: 1,
    });
    return [
      {
        id: 'hour',
        header: 'Time',
        accessor: (row) => row.hour,
        format: (hour) => time.format(Date.UTC(2026, 0, 1, Number(hour))),
        rowHeader: true,
      },
      {
        id: 'temperature',
        header: 'Temperature',
        accessor: (row) => row.temperature,
        type: 'number',
        format: (value) => celsius.format(Number(value)),
      },
      {
        id: 'humidity',
        header: 'Humidity',
        accessor: (row) => row.humidity,
        type: 'number',
        format: (value) => percent.format(Number(value)),
      },
      {
        id: 'wind',
        header: 'Wind',
        accessor: (row) => row.wind,
        type: 'number',
        format: (value) => speed.format(Number(value)),
      },
    ];
  }, [locale]);
  return (
    <div className="w-full">
      <DataTable<Reading>
        plain
        aria-label="Readings through the day"
        columns={columns}
        rows={READINGS}
        getRowId={(row) => String(row.hour)}
        maxHeight={320}
      />
    </div>
  );
}
