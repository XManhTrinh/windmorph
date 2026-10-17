/**
 * A static shape outline: a closed SVG path in the unit square (0–1 on both axes), drawn
 * with a CSS mask that scales with the element (`materialShapeMask`). The 35 M3 Expressive
 * shapes are exported precomputed as `<name>Shape` constants (`cookie12SidedShape`, …), so an
 * app pays only for the outlines it imports; any outline in the unit square works too.
 */
export interface MaterialShapePath {
  /** The shape's name, which components write to their `data-shape` (e.g. `Cookie12Sided`). */
  readonly name: string;
  /** SVG path data in the unit square. The precomputed shapes use 3 decimals. */
  readonly path: string;
}
