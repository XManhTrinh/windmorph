/*
 * Port of androidx.graphics.shapes CornerRounding.kt (Apache-2.0, see LICENSE-androidx.md).
 */

/**
 * How a polygon corner is rounded: `radius` of the circular arc, and `smoothing` (0..1) that
 * blends the arc into the edges with flanking curves.
 */
export class CornerRounding {
  static readonly Unrounded = new CornerRounding();

  constructor(
    readonly radius = 0,
    readonly smoothing = 0,
  ) {}
}
