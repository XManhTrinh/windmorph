/*
 * Port of androidx.compose.material3 internal/ShapeUtil.kt (Apache-2.0, see
 * LICENSE-androidx.md), writing SVG path data instead of a Compose Path.
 */
import type { Cubic } from './cubic';
import type { Morph } from './morph';
import type { RoundedPolygon } from './rounded-polygon';

export interface PathOptions {
  /**
   * Rotates the path about the rotation pivot so its first point sits at this angle, in
   * degrees (clockwise from +x, as y points down). 0 leaves the path unrotated. Compose rotates
   * about the origin and re-centers the outline afterwards; SVG has no such step, so this
   * port rotates about the pivot directly.
   */
  startAngle?: number;
  /** Draws the outline twice before closing, for phased partial drawing. */
  repeatPath?: boolean;
  closePath?: boolean;
  /** Scales the path, e.g. to map a normalized unit shape onto a viewBox. */
  scale?: number;
  /** Moves the path after scaling. */
  translateX?: number;
  translateY?: number;
}

export interface MorphPathOptions extends PathOptions {
  rotationPivotX?: number;
  rotationPivotY?: number;
}

/** SVG path data for a polygon, pivoting any rotation on its center. */
export function polygonToPath(polygon: RoundedPolygon, options: PathOptions = {}): string {
  return pathFromCubics(polygon.cubics, {
    ...options,
    rotationPivotX: polygon.centerX,
    rotationPivotY: polygon.centerY,
  });
}

/** SVG path data for a morph at `progress`. */
export function morphToPath(
  morph: Morph,
  progress: number,
  options: MorphPathOptions = {},
): string {
  return pathFromCubics(morph.asCubics(progress), options);
}

// Four decimals stays sub-pixel even for unit-square shapes drawn large, and keeps paths short.
const fmt = (n: number) => {
  const r = Math.round(n * 10000) / 10000;
  return Object.is(r, -0) ? '0' : String(r);
};

/** SVG path data for a list of connected cubics. */
export function cubicsToPath(cubics: readonly Cubic[], options: MorphPathOptions = {}): string {
  return pathFromCubics(cubics, options);
}

function pathFromCubics(
  cubics: readonly Cubic[],
  {
    startAngle = 0,
    repeatPath = false,
    closePath = true,
    scale = 1,
    translateX = 0,
    translateY = 0,
    rotationPivotX = 0,
    rotationPivotY = 0,
  }: MorphPathOptions,
): string {
  if (cubics.length === 0) return '';
  let transform = (x: number, y: number): [number, number] => [
    x * scale + translateX,
    y * scale + translateY,
  ];
  if (startAngle !== 0) {
    const first = cubics[0]!;
    const angleToFirstCubic =
      (Math.atan2(first.anchor0Y - rotationPivotY, first.anchor0X - rotationPivotX) * 180) /
      Math.PI;
    const a = ((-angleToFirstCubic + startAngle) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    transform = (x, y) => {
      const dx = x - rotationPivotX;
      const dy = y - rotationPivotY;
      return [
        (rotationPivotX + dx * c - dy * s) * scale + translateX,
        (rotationPivotY + dx * s + dy * c) * scale + translateY,
      ];
    };
  }
  const point = (x: number, y: number) => transform(x, y).map(fmt).join(' ');
  const curve = (cubic: Cubic) =>
    `C${point(cubic.control0X, cubic.control0Y)} ${point(cubic.control1X, cubic.control1Y)} ${point(cubic.anchor1X, cubic.anchor1Y)}`;

  const first = cubics[0]!;
  const parts = [`M${point(first.anchor0X, first.anchor0Y)}`, ...cubics.map(curve)];
  if (repeatPath) parts.push(`L${point(first.anchor0X, first.anchor0Y)}`, ...cubics.map(curve));
  if (closePath) parts.push('Z');
  return parts.join('');
}
