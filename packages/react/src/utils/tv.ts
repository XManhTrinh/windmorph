import { createTV } from 'tailwind-variants/lite';
import { twMerge } from './cn';

/**
 * tailwind-variants with the merger {@link cn} uses, the M3 token rules included. The lite
 * entry ships no merge table of its own (tailwind-variants 4 bundles one in its default entry),
 * so recipes and `cn` resolve conflicts with the same code, as they did with 3.x's
 * `twMergeConfig` (2026-11-16).
 */
export const tv = createTV({ twMerge });

export type { VariantProps } from 'tailwind-variants';
