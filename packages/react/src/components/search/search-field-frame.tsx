'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { mergeProps, useFocusRing } from 'react-aria';
import { searchBarStyles } from './search-styles';

/** What the pill draws around its input. Internal: the search bar, `SearchField` and `Select`. */
interface SearchFieldFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The container colour: the search bar's own, or a search app bar's. @default "default" */
  tone?: 'default' | 'appBar' | 'scrolled';
  /** M3's disabled colours. */
  disabled?: boolean;
  /** The leading slot, already wrapped in its `data-slot="leading"` element. */
  leading?: ReactNode;
  /** The trailing slot, already wrapped in its `data-slot="trailing"` element. */
  trailing?: ReactNode;
  /** The input. */
  children: ReactNode;
}

/**
 * The M3 search bar's pill: the `md-comp-search-bar` tokens and the inset focus ring while its
 * input has keyboard focus. `SearchBar` (collapsed and in its views), `SearchField` and a
 * searchable `Select` draw it, so they can't drift; the first two wrap it in standard icon
 * buttons (`standardIconButtons`), which `Select`'s search, with none, doesn't load. Not
 * exported from the package.
 */
export function SearchFieldFrame({
  tone = 'default',
  disabled = false,
  className,
  leading,
  trailing,
  children,
  ...props
}: SearchFieldFrameProps) {
  // The pill shows the inset focus ring while its input has keyboard focus.
  const { isFocusVisible, focusProps } = useFocusRing({ within: true, isTextInput: true });
  return (
    <div
      {...mergeProps(props, focusProps)}
      data-tokens="md-comp-search-bar"
      data-focus-visible={isFocusVisible || undefined}
      className={searchBarStyles({ tone, disabled }).field({ class: className })}
    >
      {leading}
      {children}
      {trailing}
    </div>
  );
}
