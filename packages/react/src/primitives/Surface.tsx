import type { ComponentPropsWithRef } from 'react';
import { cn } from '../utils/cn';
import { tv, type VariantProps } from '../utils/tv';

/** Variant definitions for {@link Surface}; extend them to add your own containers. */
export const surfaceStyles = tv({
  variants: {
    container: {
      surface: 'bg-surface text-on-surface',
      'surface-dim': 'bg-surface-dim text-on-surface',
      'surface-bright': 'bg-surface-bright text-on-surface',
      'surface-container-lowest': 'bg-surface-container-lowest text-on-surface',
      'surface-container-low': 'bg-surface-container-low text-on-surface',
      'surface-container': 'bg-surface-container text-on-surface',
      'surface-container-high': 'bg-surface-container-high text-on-surface',
      'surface-container-highest': 'bg-surface-container-highest text-on-surface',
      'inverse-surface': 'bg-inverse-surface text-inverse-on-surface',
      'primary-container': 'bg-primary-container text-on-primary-container',
      'secondary-container': 'bg-secondary-container text-on-secondary-container',
      'tertiary-container': 'bg-tertiary-container text-on-tertiary-container',
      'error-container': 'bg-error-container text-on-error-container',
    },
    elevation: {
      0: 'shadow-elevation-0',
      1: 'shadow-elevation-1',
      2: 'shadow-elevation-2',
      3: 'shadow-elevation-3',
      4: 'shadow-elevation-4',
      5: 'shadow-elevation-5',
    },
    shape: {
      none: 'rounded-corner-none',
      'extra-small': 'rounded-corner-extra-small',
      small: 'rounded-corner-small',
      medium: 'rounded-corner-medium',
      large: 'rounded-corner-large',
      'large-increased': 'rounded-corner-large-increased',
      'extra-large': 'rounded-corner-extra-large',
      'extra-large-increased': 'rounded-corner-extra-large-increased',
      'extra-extra-large': 'rounded-corner-extra-extra-large',
      full: 'rounded-corner-full',
    },
  },
  defaultVariants: {
    container: 'surface',
    elevation: 0,
    shape: 'none',
  },
});

export type SurfaceVariants = VariantProps<typeof surfaceStyles>;

export interface SurfaceProps extends ComponentPropsWithRef<'div'>, SurfaceVariants {}

/**
 * A themed container: an M3 surface colour role with its matching content colour,
 * an elevation shadow and a corner shape. Layout-neutral; `className` and `style`
 * apply to the element itself.
 */
export function Surface({ container, elevation, shape, className, ...props }: SurfaceProps) {
  return (
    <div {...props} className={cn(surfaceStyles({ container, elevation, shape }), className)} />
  );
}
