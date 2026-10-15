/**
 * M3 web density levels, `0` (default) to `-3`. `data-density` sets `--md-sys-density` for a
 * subtree; components scale their heights by it (architecture §5, Density).
 */
export const DENSITIES = [0, -1, -2, -3] as const;

/** A density level: `0` (default) to `-3` (densest). Each step takes 4px off a component's height. */
export type Density = (typeof DENSITIES)[number];

export const DEFAULT_DENSITY: Density = 0;

/** Whether `value` is a density level, as a number or as its attribute text (`"-2"`). */
export function isDensity(value: unknown): value is Density | `${Density}` {
  return DENSITIES.some((level) => level === value || String(level) === value);
}

/**
 * The `data-density` attribute for an element, or nothing when `density` is left out (the
 * element then inherits its ancestors' density). Spread it on a component's root.
 */
export function densityAttribute(density: Density | undefined): { 'data-density'?: `${Density}` } {
  return density === undefined ? {} : { 'data-density': `${density}` };
}
