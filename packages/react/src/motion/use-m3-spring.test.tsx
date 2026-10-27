import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { setMediaQueries } from '../../test/setup';
import { ThemeScope } from '../theme/ThemeScope';
import { useM3Spring } from './use-m3-spring';

const withMotion = (motion: 'expressive' | 'standard') =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeScope motion={motion}>{children}</ThemeScope>;
  };

describe('useM3Spring', () => {
  it('uses the expressive scheme by default', () => {
    const { result } = renderHook(() => useM3Spring('spatial', 'fast'));
    expect(result.current).toEqual({ type: 'spring', stiffness: 800, damping: 33.94, mass: 1 });
  });

  it('follows the motion scheme of the nearest scope', () => {
    const { result } = renderHook(() => useM3Spring('spatial', 'fast'), {
      wrapper: withMotion('standard'),
    });
    expect(result.current.stiffness).toBe(1400);
  });

  it('switches to the standard scheme under prefers-reduced-motion', () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    const { result } = renderHook(() => useM3Spring('spatial', 'default'), {
      wrapper: withMotion('expressive'),
    });
    expect(result.current.stiffness).toBe(700);
  });
});
