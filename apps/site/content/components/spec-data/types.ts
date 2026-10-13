/**
 * The catalog's spec data: for each component page, what it covers of the M3 Expressive spec
 * (each item mapped to the live examples that show it), where it deliberately differs, what it
 * adds beyond the spec, what it leaves out, and its Jetpack Compose counterparts. The API tab's
 * spec status, the `/spec-status` summary and the `/from-compose` guide are all built from it,
 * so they can't drift apart. Kept out of `catalog.ts`, which the client navigation imports.
 */

/** How the M3 spec groups an item: its "Variants" and "Configurations" tables, or a main use. */
export type SpecItemKind = 'variant' | 'configuration' | 'use case';

/** One item of the spec's Variants or Configurations tables, or a main use from its guidelines. */
export interface SpecItem {
  /** The spec's own name for it, e.g. "Toggle (selection)" or "Size: XS to XL". */
  name: string;
  kind: SpecItemKind;
  /**
   * The live examples on the Overview tab that show it: example ids, the file's path under
   * `examples/` without `.tsx` (`button/button-toggle`). At least one.
   */
  examples: string[];
}

/** A note about one part of a component: a difference, an extension or a gap. */
export interface SpecNote {
  /** What the note is about, e.g. "Press bump on connected groups". */
  item: string;
  /** What Windmorph does, and why. One or two sentences. */
  note: string;
}

/** A Compose parameter and the Windmorph prop that does the same job. */
export interface ComposeParam {
  /** The Compose parameter, e.g. `expanded` or `floatingActionButton`. */
  compose: string;
  /** The Windmorph prop (or props), e.g. `fab`. */
  windmorph: string;
  /** How they differ, if they do. */
  note?: string;
}

/** A Compose Material 3 composable and the Windmorph component that replaces it. */
export interface ComposeMapping {
  /** The composable, e.g. `HorizontalFloatingToolbar`. */
  composable: string;
  /** The Windmorph export, e.g. `FloatingToolbar` (with its props, e.g. `NavigationRail expanded`). */
  component: string;
  /** Key parameters and their props. */
  params?: ComposeParam[];
  /** Anything else worth knowing when porting. */
  note?: string;
}

/** A component page's spec data. */
export interface ComponentSpecData {
  /**
   * The spec page this follows, the path under `https://m3.material.io/components/`
   * (`buttons/specs`). Omitted for Windmorph Pro components, which aren't in M3.
   */
  spec?: string;
  /**
   * What the page covers. For an M3 component, the spec's Variants and Configurations and its
   * main uses; for a Pro component, its own variants and configurations.
   */
  covers: SpecItem[];
  /** Deliberate differences from the M3 Expressive spec. */
  differences?: SpecNote[];
  /** Behaviour or API beyond the spec. */
  extensions?: SpecNote[];
  /** Parts of the spec that aren't built, and why. */
  notBuilt?: SpecNote[];
  /** The Jetpack Compose Material 3 counterparts, for the "From Compose" guide. */
  compose?: ComposeMapping[];
  /**
   * Why the Overview tab shows hand-written examples and no playground. Required for a page
   * whose catalog `playground` is `showcase`.
   */
  showcaseReason?: string;
}
