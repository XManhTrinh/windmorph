/**
 * M3 web density: how compact components are, from `0` (the default, touch-friendly) to `-3`
 * (densest). M3 applies density only on the web and only when people choose it ("Avoid
 * applying density by default … give people a way to choose a higher density, like selecting a
 * denser layout or changing the theme").
 *
 * Density is set with a `data-density` attribute (written by `ThemeProvider`, `ThemeScope` or a
 * component's `density` prop), which sets `--md-sys-density` to the level for the subtree. A
 * component reads the variable in its sizes, e.g. a text field's container is
 * `calc(56px + var(--md-sys-density, 0) * 4px)`, so density needs no JavaScript and works in
 * server-rendered and static pages. Each level takes 4px off a component's height (M3:
 * "Increasing density decreases the top and bottom padding").
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
