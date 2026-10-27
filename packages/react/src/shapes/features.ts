/*
 * Port of androidx.graphics.shapes Features.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import type { Cubic } from './cubic';
import { DistanceEpsilon, type PointTransformer } from './point';

/**
 * A part of a polygon outline: an edge, or a convex or concave corner. Morphing matches
 * corresponding features (corners) between two shapes.
 */
export abstract class Feature {
  constructor(readonly cubics: readonly Cubic[]) {}

  abstract transformed(f: PointTransformer): Feature;
  abstract reversed(): Feature;
  abstract readonly isIgnorableFeature: boolean;
  abstract readonly isEdge: boolean;
  abstract readonly isConvexCorner: boolean;
  abstract readonly isConcaveCorner: boolean;

  static buildIgnorableFeature(cubics: readonly Cubic[]): Feature {
    return validated(new Edge(cubics));
  }

  static buildEdge(cubic: Cubic): Feature {
    return new Edge([cubic]);
  }

  static buildConvexCorner(cubics: readonly Cubic[]): Feature {
    return validated(new Corner(cubics, true));
  }

  static buildConcaveCorner(cubics: readonly Cubic[]): Feature {
    return validated(new Corner(cubics, false));
  }
}

function isContinuous(feature: Feature): boolean {
  let prev = feature.cubics[0]!;
  for (let i = 1; i < feature.cubics.length; i++) {
    const cubic = feature.cubics[i]!;
    if (
      Math.abs(cubic.anchor0X - prev.anchor1X) > DistanceEpsilon ||
      Math.abs(cubic.anchor0Y - prev.anchor1Y) > DistanceEpsilon
    ) {
      return false;
    }
    prev = cubic;
  }
  return true;
}

function validated(feature: Feature): Feature {
  if (feature.cubics.length === 0) throw new Error('Features need at least one cubic.');
  if (!isContinuous(feature)) {
    throw new Error(
      'Feature must be continuous, with the anchor points of all cubics matching the anchor points of the preceding and succeeding cubics',
    );
  }
  return feature;
}

const reverseCubics = (cubics: readonly Cubic[]) =>
  [...cubics].reverse().map((cubic) => cubic.reverse());

export class Edge extends Feature {
  readonly isIgnorableFeature = true;
  readonly isEdge = true;
  readonly isConvexCorner = false;
  readonly isConcaveCorner = false;

  transformed(f: PointTransformer): Edge {
    return new Edge(this.cubics.map((cubic) => cubic.transformed(f)));
  }

  reversed(): Edge {
    return new Edge(reverseCubics(this.cubics));
  }

  override toString(): string {
    return 'Edge';
  }
}

export class Corner extends Feature {
  readonly isIgnorableFeature = false;
  readonly isEdge = false;

  constructor(
    cubics: readonly Cubic[],
    readonly convex = true,
  ) {
    super(cubics);
  }

  get isConvexCorner(): boolean {
    return this.convex;
  }

  get isConcaveCorner(): boolean {
    return !this.convex;
  }

  transformed(f: PointTransformer): Corner {
    return new Corner(
      this.cubics.map((cubic) => cubic.transformed(f)),
      this.convex,
    );
  }

  reversed(): Corner {
    // androidx b/369320447: the flag is negated until RoundedPolygon ignores orientation.
    return new Corner(reverseCubics(this.cubics), !this.convex);
  }

  override toString(): string {
    return `Corner: cubics=${this.cubics.map((c) => `[${c}]`).join(', ')} convex=${this.convex}`;
  }
}
