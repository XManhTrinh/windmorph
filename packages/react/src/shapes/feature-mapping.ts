/*
 * Port of androidx.graphics.shapes FeatureMapping.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import { DoubleMapper, progressDistance, progressInRange } from './float-mapping';
import { Corner, type Feature } from './features';
import { DistanceEpsilon, Point } from './point';
import type { ProgressableFeature } from './polygon-measure';

type Mapping = readonly [number, number];

/** Maps outline progress between two shapes by pairing their closest corners. */
export function featureMapper(
  features1: readonly ProgressableFeature[],
  features2: readonly ProgressableFeature[],
): DoubleMapper {
  // Only corners take part in the mapping.
  const corners1 = features1.filter((f) => f.feature instanceof Corner);
  const corners2 = features2.filter((f) => f.feature instanceof Corner);
  return new DoubleMapper(...doMapping(corners1, corners2));
}

const IdentityMapping: readonly Mapping[] = [
  [0, 0],
  [0.5, 0.5],
];

export function doMapping(
  features1: readonly ProgressableFeature[],
  features2: readonly ProgressableFeature[],
): readonly Mapping[] {
  const candidates: { distance: number; f1: ProgressableFeature; f2: ProgressableFeature }[] = [];
  for (const f1 of features1) {
    for (const f2 of features2) {
      const d = featureDistSquared(f1.feature, f2.feature);
      if (d !== Infinity) candidates.push({ distance: d, f1, f2 });
    }
  }
  // Array.prototype.sort is stable, matching Kotlin's sortedBy.
  candidates.sort((a, b) => a.distance - b.distance);

  if (candidates.length === 0) return IdentityMapping;
  if (candidates.length === 1) {
    const p1 = candidates[0]!.f1.progress;
    const p2 = candidates[0]!.f2.progress;
    return [
      [p1, p2],
      [(p1 + 0.5) % 1, (p2 + 0.5) % 1],
    ];
  }
  const helper = new MappingHelper();
  for (const { f1, f2 } of candidates) helper.addMapping(f1, f2);
  return helper.mapping;
}

class MappingHelper {
  /** Start-shape to end-shape progress pairs, sorted by start progress. */
  readonly mapping: Mapping[] = [];
  private readonly usedF1 = new Set<ProgressableFeature>();
  private readonly usedF2 = new Set<ProgressableFeature>();

  addMapping(f1: ProgressableFeature, f2: ProgressableFeature): void {
    // Map each feature at most once.
    if (this.usedF1.has(f1) || this.usedF2.has(f2)) return;

    const index = binarySearchBy(this.mapping, f1.progress);
    if (index >= 0) throw new Error("There can't be two features with the same progress");
    const insertionIndex = -index - 1;
    const n = this.mapping.length;
    if (n >= 1) {
      const [before1, before2] = this.mapping[(insertionIndex + n - 1) % n]!;
      const [after1, after2] = this.mapping[insertionIndex % n]!;
      // Features too close to their neighbours would make the DoubleMapper unstable.
      if (
        progressDistance(f1.progress, before1) < DistanceEpsilon ||
        progressDistance(f1.progress, after1) < DistanceEpsilon ||
        progressDistance(f2.progress, before2) < DistanceEpsilon ||
        progressDistance(f2.progress, after2) < DistanceEpsilon
      ) {
        return;
      }
      // With two or more mappings, don't add crossings.
      if (n > 1 && !progressInRange(f2.progress, before2, after2)) return;
    }
    this.mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    this.usedF1.add(f1);
    this.usedF2.add(f2);
  }
}

/** Kotlin's `binarySearchBy` on the first element: the index, or `-(insertion point) - 1`. */
function binarySearchBy(list: readonly Mapping[], key: number): number {
  let low = 0;
  let high = list.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const value = list[mid]![0];
    if (value < key) low = mid + 1;
    else if (value > key) high = mid - 1;
    else return mid;
  }
  return -(low + 1);
}

export function featureDistSquared(f1: Feature, f2: Feature): number {
  // Corners only map to corners of the same concavity.
  if (f1 instanceof Corner && f2 instanceof Corner && f1.convex !== f2.convex) return Infinity;
  return featureRepresentativePoint(f1).minus(featureRepresentativePoint(f2)).getDistanceSquared();
}

export function featureRepresentativePoint(feature: Feature): Point {
  const first = feature.cubics[0]!;
  const last = feature.cubics[feature.cubics.length - 1]!;
  return new Point((first.anchor0X + last.anchor1X) / 2, (first.anchor0Y + last.anchor1Y) / 2);
}
