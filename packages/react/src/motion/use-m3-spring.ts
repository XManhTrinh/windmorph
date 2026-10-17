'use client';

import { useReducedMotion } from 'motion/react';
import { useThemeScope } from '../theme/context';
import type { MotionSpring, SpringFamily, SpringSpeed } from '../tokens/motion';
import { getM3Spring } from './get-m3-spring';

/**
 * The Motion spring for the active motion scheme (from `ThemeProvider` / `ThemeScope`).
 * `prefers-reduced-motion` forces the `standard` scheme, which never visibly overshoots.
 *
 * @example
 * const spring = useM3Spring('spatial', 'fast');
 * <m.div animate={{ scale: 1 }} transition={spring} />
 */
export function useM3Spring(family: SpringFamily, speed: SpringSpeed = 'default'): MotionSpring {
  const { motion } = useThemeScope();
  const prefersReducedMotion = useReducedMotion();
  return getM3Spring(prefersReducedMotion ? 'standard' : motion, family, speed);
}
