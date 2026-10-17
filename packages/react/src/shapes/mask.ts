import { MaterialShapes, type MaterialShapeName } from './material-shapes';
import { polygonToPath } from './path';

const cache = new Map<MaterialShapeName, string>();

/**
 * An M3 Expressive shape as a CSS `mask-image`, drawn in a 1 × 1 box so it scales with the
 * element it masks (with `mask-size: 100% 100%`). Used by `Avatar` and `EmptyState`.
 */
export function materialShapeMask(shape: MaterialShapeName): string {
  let mask = cache.get(shape);
  if (!mask) {
    const path = polygonToPath(MaterialShapes[shape]);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" overflow="visible"><path d="${path}"/></svg>`;
    mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    cache.set(shape, mask);
  }
  return mask;
}
