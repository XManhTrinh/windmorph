'use client';

import { useContext, useMemo, type ReactNode } from 'react';
import { ButtonContext } from './ButtonContext';

/**
 * Keeps the icon buttons inside at density 0, for a part that keeps its own size at every
 * density (a navigation rail's header, a dialog's or sheet's header). The rest of the
 * enclosing `ButtonContext` carries through, and an icon button's own `density` wins.
 */
export function DensityZeroButtons({ children }: { children: ReactNode }) {
  const parent = useContext(ButtonContext);
  const value = useMemo(() => ({ ...parent, density: 0 as const }), [parent]);
  return <ButtonContext value={value}>{children}</ButtonContext>;
}
