import type { MaterialShapePath } from './shape-path';

const cache = new WeakMap<MaterialShapePath, string>();

/**
 * A static shape outline as a CSS `mask-image` value: an SVG `data:` URI drawn in a 1 × 1
 * box, so with `mask-size: 100% 100%` one outline serves every element size. Pass a
 * precomputed shape (`materialShapeMask(cookie12SidedShape)`), one picked by name
 * (`materialShapePaths[name]`) or your own outline in the unit square.
 *
 * It loads no shape engine: the outline is already computed. Shapes that morph use
 * `MaterialShapes`, `Morph` and `useM3Morph` instead.
 */
export function materialShapeMask(shape: MaterialShapePath): string {
  let mask = cache.get(shape);
  if (mask === undefined) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" overflow="visible"><path d="${shape.path}"/></svg>`;
    mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    cache.set(shape, mask);
  }
  return mask;
}
