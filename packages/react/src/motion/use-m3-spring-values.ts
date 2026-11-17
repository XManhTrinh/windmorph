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
  /**
   * Seconds each element waits before a move from rest: one for all, or one per element. An
   * element already moving turns to its new target at once. @default 0
   */
  delay?: number | readonly number[];
  /**
   * Where a new element starts: one for all, one per element (a point entering at its own
   * place), or worked out from the list as it shows at the change (`shown`, in the old list's
   * order: a point entering on a line where the line is). Used for every element when there
   * was no list before, and for each new key.
   * @default 0
   */
  rest?: number | readonly number[] | ((shown: readonly number[]) => readonly number[]);
  /**
   * Names each element, so a new list is matched to the old one by name rather than by place:
   * a kept key moves on from where its element is, at its speed, and a new key starts at
   * `rest` (a window of a feed sliding on: kept bars carry on, a new one grows from the
   * baseline). Without keys, elements match by place, and a list of another length starts
   * from the old one read at the new places.
   */
  keys?: readonly string[];
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
  return { value: move.target + displacement, velocity };
};

// `Object.is`, so a list holding NaN is the same list on the next render.
const sameList = <T>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((value, index) => Object.is(value, b[index]));

/** The list's largest finite magnitude, at least 1: what "close enough to settle" scales by. */
function magnitude(list: readonly number[]) {
  let largest = 1;
  for (const value of list)
    if (Number.isFinite(value)) largest = Math.max(largest, Math.abs(value));
  return largest;
}

/**
 * A list of numbers that springs as one to each new `targets`, on the theme's spring: a line's
 * points, a stack's bars. Each element keeps its own position and speed when a new list arrives
 * mid-move, and a list of another length starts from the old one read at the new places
 * ({@link resample}), so a 7-point line becomes an 84-point one by moving. One frame callback
 * advances every element with the closed-form spring, so a long list is one loop. Reduced
 * motion and `animate: false` jump, as {@link useM3SpringValue} does. On the server and in the
 * first render it is `targets`.
 *
 * @param targets Where the elements go; a list with any element changed starts a move.
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
    keys,
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
    keys: readonly string[] | undefined;
  }>({
    moves: [],
    pending: [],
    spring: SPRINGS.standard.spatial.default,
    tick: null,
    targets,
    keys,
  });

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
    const previousKeys = current.keys;
    current.keys = keys;
    if (!animated || (reducedMotion && family === 'spatial')) {
      current.targets = targets;
      jump();
      return;
    }
    const spring = SPRINGS[reducedMotion ? 'standard' : motion][family][speed];
    const changed =
      !sameList(current.targets, targets) ||
      (keys !== undefined && previousKeys !== undefined && !sameList(previousKeys, keys));
    current.targets = targets;
    if (!changed) {
      // A new scheme applies from the next move; a move under way keeps its spring. With no
      // frame callback (none yet, or stopped while hidden by an `Activity`), it shows the targets.
      if (current.tick === null) {
        current.spring = spring;
        current.moves = [];
        current.pending = [];
        if (!sameList(value.get(), targets)) value.jump(targets);
      }
      return;
    }

    const now = time.now();
    // Where each element is and how fast it moves now (not at the last frame), read at the new
    // length.
    const states = value.get().map((position, index) => {
      const move = current.moves[index];
      return move ? stateAt(current.spring, move, now) : { value: position, velocity: 0 };
    });
    const rests = typeof rest === 'function' ? rest(states.map((state) => state.value)) : rest;
    const restAt = (index: number) => (typeof rests === 'number' ? rests : (rests[index] ?? 0));
    let positions: number[];
    let speeds: number[];
    if (keys && previousKeys && previousKeys.length === states.length) {
      // Matched by name: a kept key carries on, a new one starts at rest.
      const before = new Map(previousKeys.map((key, index) => [key, states[index]!]));
      const matched = keys.map((key) => before.get(key));
      positions = matched.map((state, index) => state?.value ?? restAt(index));
      speeds = matched.map((state) => state?.velocity ?? 0);
    } else if (states.length === 0) {
      positions = targets.map((_, index) => restAt(index));
      speeds = targets.map(() => 0);
    } else {
      // Matched by place: the old list read at the new length.
      const shown = states.map((state) => state.value);
      const velocities = states.map((state) => state.velocity);
      positions = resample(shown, targets.length);
      speeds =
        shown.length === targets.length ? velocities : resample(velocities, targets.length, 0);
    }
    current.spring = spring;
    current.moves = targets.map((_, index) => ({
      origin: positions[index]!,
      velocity: speeds[index] ?? 0,
      target: positions[index]!,
      start: now,
    }));
    // An element at rest holds where it is until its delay ends; one moving turns at once.
    current.pending = targets.map((target, index) => {
      const wait = speeds[index] ? 0 : typeof delay === 'number' ? delay : (delay[index] ?? 0);
      return { origin: 0, velocity: 0, target, start: now + wait * 1000 };
    });
    value.set(positions);

    const scale = magnitude(targets);
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
      const current = state.current;
      if (current.tick) cancelFrame(current.tick);
      current.tick = null;
    },
    [],
  );

  return value;
}
