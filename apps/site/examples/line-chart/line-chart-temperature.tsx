'use client';

import { useLocale } from '@windmorph/react';
import { ChartFrame, LineChart, type ChartPlace } from '@windmorph/react-pro/charts';
import { useMemo } from 'react';

/** Sixteen hours overnight, from 18:00 on Tuesday to 09:00 on Wednesday. */
const HOURS: ChartPlace[] = Array.from({ length: 16 }, (_, index) => {
  const time = `${String((18 + index) % 24).padStart(2, '0')}:00`;
  const day = index < 6 ? 'Tuesday' : 'Wednesday';
  return { key: `${day} ${time}`, tick: time, name: `${day} ${time}` };
});

/** Tuesday from 18:00 to 23:00, in °C. */
const EVENING = [3.4, 2.6, 1.9, 1.1, 0.4, -0.5];

/**
 * Wednesday from 00:00 to 09:00. The station was offline at 02:00 and 03:00: `null`, no value,
 * rather than a made-up 0.
 */
const MORNING = [-1.3, -2.2, null, null, -4.1, -4.8, -4.4, -3.2, -1.6, 0.3];

const READINGS = [...EVENING, ...MORNING];

/**
 * A weather station's readings through a frosty night. Values below nought take the axis below
 * a nought line, and the wash under the only line runs to it. The hours with no reading are a
 * gap in the line, and the readout, the table and screen readers say "No value" there.
 * `curve="linear"` joins the readings with straight lines, and `formatValue` writes the unit in
 * the page's locale.
 */
export function LineChartTemperature() {
  const { locale } = useLocale();
  const formatValue = useMemo(() => {
    const celsius = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'celsius',
      maximumFractionDigits: 1,
    });
    return (value: number) => celsius.format(value);
  }, [locale]);
  return (
    <ChartFrame
      title="Temperature"
      description="Every hour overnight, from the weather station on the hill"
      className="w-full"
    >
      <LineChart
        places={HOURS}
        series={[{ key: 'temperature', label: 'Temperature', values: READINGS }]}
        curve="linear"
        formatValue={formatValue}
        placeLabel="Time"
      />
    </ChartFrame>
  );
}
