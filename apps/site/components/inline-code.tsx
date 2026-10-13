import type { ReactNode } from 'react';

export interface InlineCodeProps {
  /** The code: a component, prop, token or value name. */
  children: ReactNode;
  className?: string;
}

/**
 * A code name inside running text, set as a quiet chip: monospace on `surface-container-high`
 * with 4px corners. Long tokens wrap at their hyphens, and the chip's padding and background
 * repeat on each line it wraps onto. The look lives in `globals.css` (`.inline-code`), shared
 * with plain prose `<code>` so both read the same. A Server Component.
 */
export function InlineCode({ children, className }: InlineCodeProps) {
  return <code className={className ? `inline-code ${className}` : 'inline-code'}>{children}</code>;
}
