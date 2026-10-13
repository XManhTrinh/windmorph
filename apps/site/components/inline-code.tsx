import type { ComponentPropsWithoutRef } from 'react';

export type InlineCodeProps = ComponentPropsWithoutRef<'code'>;

/**
 * A code name inside running text, set as a quiet chip: monospace on `surface-container-high`
 * with 4px corners. Long tokens wrap at their hyphens, and the chip's padding and background
 * repeat on each line it wraps onto. The look lives in `globals.css` (`.inline-code`), shared
 * with plain prose `<code>` so both read the same. Pass `dir="ltr"` for code that must read
 * left to right on a right-to-left page. A Server Component.
 */
export function InlineCode({ className, ...props }: InlineCodeProps) {
  return <code {...props} className={className ? `inline-code ${className}` : 'inline-code'} />;
}
