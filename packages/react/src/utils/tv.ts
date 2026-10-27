import { createTV } from 'tailwind-variants';
import { twMergeConfig } from './cn';

/** tailwind-variants configured with the same merge rules as {@link cn}. */
export const tv = createTV({ twMergeConfig });

export type { VariantProps } from 'tailwind-variants';
