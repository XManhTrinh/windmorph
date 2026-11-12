import { Time } from '@internationalized/date';

/** The shortest step a list of times takes, in minutes: a shorter one would list hundreds. */
const MIN_TIME_STEP = 5;

const DAY = 24 * 60;

/** A time's minutes past midnight, which also keys it in a list. */
export const minutesOf = (time: Time) => time.hour * 60 + time.minute;

/**
 * The times a docked list offers: every `step` minutes of the day, counted from midnight,
 * within `min` and `max`. A `value` between two steps is listed too, in its place, and a
 * range that holds no step lists its earliest time, so the list is never empty.
 */
export function listTimes(
  step: number,
  min: Time | undefined,
  max: Time | undefined,
  value: Time | null,
): Time[] {
  const every = Math.max(MIN_TIME_STEP, Math.round(step) || MIN_TIME_STEP);
  const allowed = (time: Time) =>
    (min === undefined || time.compare(min) >= 0) && (max === undefined || time.compare(max) <= 0);
  const marks = new Set<number>();
  for (let at = 0; at < DAY; at += every) marks.add(at);
  if (value) marks.add(minutesOf(value));
  const times = [...marks]
    .sort((a, b) => a - b)
    .map((at) => new Time(Math.floor(at / 60), at % 60))
    .filter(allowed);
  if (times.length > 0) return times;
  // The earliest whole minute the range allows.
  const first = min ? new Time(min.hour, min.minute) : new Time(0, 0);
  return [min && first.compare(min) < 0 ? first.add({ minutes: 1 }) : first];
}

/** The listed time nearest `minutes` past midnight; the earlier one on a tie. */
export function nearestTime(times: readonly Time[], minutes: number): Time | undefined {
  let nearest: Time | undefined;
  for (const time of times) {
    if (
      nearest === undefined ||
      Math.abs(minutesOf(time) - minutes) < Math.abs(minutesOf(nearest) - minutes)
    ) {
      nearest = time;
    }
  }
  return nearest;
}
