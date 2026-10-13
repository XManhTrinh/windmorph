'use client';

import { useReducedMotion } from 'motion/react';
import { useThemeScope } from '../theme/context';
import {
  SPRINGS,
  toMotionSpring,
  type MotionScheme,
  type MotionSpring,
  type SpringFamily,
  type SpringSpeed,
} from '../tokens/motion';

/** The Motion spring for a motion scheme, family and speed. */
export function getM3Spring(
  scheme: MotionScheme,
  family: SpringFamily,
  speed: SpringSpeed = 'default',
): MotionSpring {
  return toMotionSpring(SPRINGS[scheme][family][speed]);
}

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
