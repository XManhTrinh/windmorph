import { FEEDBACK_PICKERS_DESCRIPTORS } from './feedback-pickers';
import { NAVIGATION_DESCRIPTORS } from './navigation';
import { CONTAINMENT_PRO_DESCRIPTORS } from './containment-pro';
import { CONTAINMENT_M3_DESCRIPTORS } from './containment-m3';
import { INPUTS_PRO_DESCRIPTORS } from './inputs-pro';
import { INPUTS_M3_DESCRIPTORS } from './inputs-m3';
import { ACTIONS_DESCRIPTORS } from './actions';
import type { PlaygroundDescriptor } from './shared';

export type { PlaygroundDescriptor } from './shared';

/**
 * Every playground, by page slug. One file per group of pages, so the groups can be edited
 * side by side.
 */
export const PLAYGROUND_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  ...ACTIONS_DESCRIPTORS,
  ...INPUTS_M3_DESCRIPTORS,
  ...INPUTS_PRO_DESCRIPTORS,
  ...CONTAINMENT_M3_DESCRIPTORS,
  ...CONTAINMENT_PRO_DESCRIPTORS,
  ...NAVIGATION_DESCRIPTORS,
  ...FEEDBACK_PICKERS_DESCRIPTORS,
};
