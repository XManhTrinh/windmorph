'use client';

import {
  animate,
  time,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { useEffect, useRef } from 'react';
import { useThemeScope } from '../theme/context';
import type { SpringFamily, SpringSpeed } from '../tokens/motion';
import { getM3Spring } from './get-m3-spring';

export interface M3SpringValueOptions {
  /** Spatial for positions and sizes, effects for opacity and colour. @default "spatial" */
  family?: SpringFamily;
  /** @default "default" */
  speed?: SpringSpeed;
  /** Seconds before this move starts (an entrance one after another). @default 0 */
  delay?: number;
  /** `false` jumps to each target: off screen, or in a hidden tab. @default true */
  animate?: boolean;
}

/**
 * A Motion value that springs to each new `target` on the theme's spring (the nearest
 * `ThemeScope`'s motion scheme), from where it is and at the speed it has: a new target
 * mid-move doesn't restart from rest. Under `prefers-reduced-motion` a spatial value jumps to
 * each target, as the spatial tokens are 0ms there; an effects value keeps its spring, as fades
 * do. On the server and in the first render it is the target.
 *
 * @example
 * const height = useM3SpringValue(value / max);
 * <m.div style={{ scaleY: height }} />
 */
export function useM3SpringValue(
  target: number,
  {
    family = 'spatial',
    speed = 'default',
    delay = 0,
    animate: animated = true,
  }: M3SpringValueOptions = {},
): MotionValue<number> {
  const value = useMotionValue(target);
  const { motion } = useThemeScope();
  const reducedMotion = useReducedMotion() === true;
  // When the value last moved: a new target mid-move starts its move there, so the frame after
  // it continues from where the old move would be, rather than holding one frame still.
  const lastMoved = useRef(0);
  useMotionValueEvent(value, 'change', () => {
    lastMoved.current = time.now();
  });

  useEffect(() => {
    if (!animated || (reducedMotion && family === 'spatial')) {
      value.jump(target);
      return;
    }
    if (value.get() === target && value.getVelocity() === 0) return;
    // Motion starts from the value's current position and velocity. A move under way (stopped
    // by now, so it shows only as speed) restarts from its last frame: a negative delay starts
    // that far in.
    const behind =
      value.getVelocity() !== 0 ? Math.min(0.05, (time.now() - lastMoved.current) / 1000) : 0;
    const controls = animate(value, target, {
      ...getM3Spring(reducedMotion ? 'standard' : motion, family, speed),
      delay: delay - behind,
    });
    return () => controls.stop();
  }, [target, animated, reducedMotion, family, speed, motion, delay, value]);

  return value;
}
