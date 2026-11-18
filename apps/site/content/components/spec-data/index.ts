import { ACTIONS_SPEC } from './actions';
import { INPUTS_M3_SPEC } from './inputs-m3';
import { INPUTS_PRO_SPEC } from './inputs-pro';
import { CONTAINMENT_M3_SPEC } from './containment-m3';
import { CONTAINMENT_PRO_SPEC } from './containment-pro';
import { NAVIGATION_SPEC } from './navigation';
import { FEEDBACK_PICKERS_SPEC } from './feedback-pickers';
import { CHARTS_FIGURES_SPEC } from './charts-figures';
import { CHARTS_CARTESIAN_SPEC } from './charts-cartesian';
import { CHARTS_PARTS_SPEC } from './charts-parts';
import type { ComponentSpecData } from './types';

export type {
  ComponentSpecData,
  ComposeMapping,
  ComposeParam,
  SpecItem,
  SpecItemKind,
  SpecNote,
} from './types';

/**
 * Every component page's spec data, by slug (see `types.ts`). One file per group of pages, so
 * the groups can be edited side by side.
 */
export const SPEC_DATA: Record<string, ComponentSpecData> = {
  ...ACTIONS_SPEC,
  ...INPUTS_M3_SPEC,
  ...INPUTS_PRO_SPEC,
  ...CONTAINMENT_M3_SPEC,
  ...CONTAINMENT_PRO_SPEC,
  ...NAVIGATION_SPEC,
  ...FEEDBACK_PICKERS_SPEC,
  ...CHARTS_FIGURES_SPEC,
  ...CHARTS_CARTESIAN_SPEC,
  ...CHARTS_PARTS_SPEC,
};

/** The m3.material.io URL of a spec page path (`buttons/specs`). */
export function m3SpecUrl(path: string): string {
  return `https://m3.material.io/components/${path}`;
}
