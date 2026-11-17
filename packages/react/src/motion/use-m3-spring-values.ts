'use client';

import {
  cancelFrame,
  frame,
  time,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { useEffect, useRef } from 'react';
import { useThemeScope } from '../theme/context';
import { SPRINGS, type SpringToken } from '../tokens/motion';
import { resample } from './resample';
import { springState } from './spring-state';
import type { M3SpringValueOptions } from './use-m3-spring-value';

export interface M3SpringValuesOptions extends Omit<M3SpringValueOptions, 'delay'> {
  /** Seconds before each element moves: one for all, or one per element. @default 0 */
  delay?: number | readonly number[];
  /** Where a new element starts when there was no list before. @default 0 */
  rest?: number;
}

// One element's move: from `origin` with `velocity` towards `target`, from `start` (ms).
interface Move {
  origin: number;
  velocity: number;
  target: number;
  start: number;
}

const stateAt = (spring: SpringToken, move: Move, now: number) => {
  const elapsed = Math.max(0, now - move.start) / 1000;
  const { displacement, velocity } = springState(
    spring,
    move.origin - move.target,
    move.velocity,
    elapsed,
  );
  return { value: move.target + displacement, velocity: elapsed === 0 ? move.velocity : velocity };
};

const sameList = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * A list of numbers that springs as one to each new `targets`, on the theme's spring: a line's
 * points, a stack's bars. Each element keeps its own position and speed when a new list arrives
 * mid-move, and a list of another length starts from the old one read at the new places
 * ({@link resample}), so a 7-point line becomes an 84-point one by moving. One frame callback
 * advances every element with the closed-form spring, so a long list is one loop. Reduced
 * motion and `animate: false` jump, as {@link useM3SpringValue} does. On the server and in the
 * first render it is `targets`.
 *
 * @example
 * const points = useM3SpringValues(values);
 * const d = useTransform(points, (list) => linePath(list));
 */
export function useM3SpringValues(
  targets: readonly number[],
  {
    family = 'spatial',
    speed = 'default',
    delay = 0,
    animate: animated = true,
    rest = 0,
  }: M3SpringValuesOptions = {},
): MotionValue<readonly number[]> {
  const value = useMotionValue<readonly number[]>(targets);
  const { motion } = useThemeScope();
  const reducedMotion = useReducedMotion() === true;
  const state = useRef<{
    moves: Move[];
    pending: (Move | null)[];
    spring: SpringToken;
    tick: ((data: { timestamp: number }) => void) | null;
    targets: readonly number[];
  }>({ moves: [], pending: [], spring: SPRINGS.standard.spatial.default, tick: null, targets });

  useEffect(() => {
    const current = state.current;
    const stop = () => {
      if (current.tick) cancelFrame(current.tick);
      current.tick = null;
    };
    const jump = () => {
      stop();
      current.moves = [];
      current.pending = [];
      value.jump(targets);
    };
    if (!animated || (reducedMotion && family === 'spatial')) {
      current.targets = targets;
      jump();
      return;
    }
    const spring = SPRINGS[reducedMotion ? 'standard' : motion][family][speed];
    const changed = !sameList(current.targets, targets);
    current.targets = targets;
    if (!changed) {
      // A new scheme applies from the next move; a move under way keeps its spring.
      if (current.tick === null) {
        current.spring = spring;
        if (!sameList(value.get(), targets)) value.jump(targets);
      }
      return;
    }

    const now = time.now();
    // Where each element is and how fast it moves now (not at the last frame), read at the new
    // length.
    const shown = value.get().map((position, index) => {
      const move = current.moves[index];
      return move ? stateAt(current.spring, move, now).value : position;
    });
    const velocities = shown.map((_, index) => {
      const move = current.moves[index];
      return move ? stateAt(current.spring, move, now).velocity : 0;
    });
    const positions = resample(shown, targets.length, rest);
    const speeds =
      shown.length === targets.length ? velocities : resample(velocities, targets.length, 0);
    current.spring = spring;
    current.moves = targets.map((_, index) => ({
      origin: positions[index]!,
      velocity: speeds[index] ?? 0,
      target: positions[index]!,
      start: now,
    }));
    current.pending = targets.map((target, index) => {
      const wait = (typeof delay === 'number' ? delay : (delay[index] ?? 0)) * 1000;
      return { origin: 0, velocity: 0, target, start: now + wait };
    });
    // The elements hold where they are until their delay ends.
    value.set(positions);

    const scale = Math.max(1, ...targets.map(Math.abs));
    const tick = ({ timestamp }: { timestamp: number }) => {
      let settled = true;
      const next = current.moves.map((move, index) => {
        const pending = current.pending[index];
        if (pending && timestamp >= pending.start) {
          const at = stateAt(current.spring, move, pending.start);
          current.moves[index] = move = {
            origin: at.value,
            velocity: at.velocity,
            target: pending.target,
            start: pending.start,
          };
          current.pending[index] = null;
        }
        const { value: position, velocity } = stateAt(current.spring, move, timestamp);
        if (
          current.pending[index] ||
          Math.abs(position - move.target) > scale * 1e-4 ||
          Math.abs(velocity) > scale * 1e-3
        ) {
          settled = false;
        }
        return position;
      });
      if (settled) {
        stop();
        current.moves = [];
        value.set(current.targets);
        return;
      }
      value.set(next);
    };
    if (current.tick) cancelFrame(current.tick);
    current.tick = tick;
    frame.update(tick, true);
  });

  useEffect(
    () => () => {
      const { tick } = state.current;
      if (tick) cancelFrame(tick);
    },
    [],
  );

  return value;
}
