import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge, type ConfigExtension } from 'tailwind-merge';
import {
  BREAKPOINT_NAMES,
  COLOR_ROLES,
  CORNER_NAMES,
  ELEVATION_LEVEL_NAMES,
  LEGACY_EASINGS,
  SPRING_TOKEN_NAMES,
  TYPE_ROLES,
} from '../tokens';

/**
 * tailwind-merge extension for the M3 theme keys, derived from the token source so
 * class merging can never drift from the generated CSS. Shared with tailwind-variants.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      color: [...COLOR_ROLES],
      text: [...TYPE_ROLES],
      radius: CORNER_NAMES.map((name) => `corner-${name}`),
      shadow: ELEVATION_LEVEL_NAMES.map((level) => `elevation-${level}`),
      ease: [
        ...SPRING_TOKEN_NAMES.map((name) => `m3-${name}`),
        ...Object.keys(LEGACY_EASINGS).map((name) => `m3-${name}`),
      ],
      breakpoint: [...BREAKPOINT_NAMES],
      font: ['brand', 'plain'],
    },
    classGroups: {
      duration: [{ duration: SPRING_TOKEN_NAMES.map((name) => `m3-${name}`) }],
    },
  },
} satisfies ConfigExtension<string, string>;

const twMerge = extendTailwindMerge<string, string>(twMergeConfig);

/**
 * Joins class names and resolves Tailwind conflicts, M3 tokens included.
 * Later classes win, so a consumer's `className` always overrides the library's.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
