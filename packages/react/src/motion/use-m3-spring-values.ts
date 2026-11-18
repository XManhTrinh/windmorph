'use client';

import {
  cancelFrame,
  frame,
  time,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
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
   * order: a point entering on a line where the line is), one entry per element of the new
   * list, of which only new elements' are used; asked only when an element is new. Used for
   * every element when there was no list before, and for each new key.
   * @default 0
   */
  rest?: number | readonly number[] | ((shown: readonly number[]) => readonly number[]);
  /**
   * Names each element (unique, one per target), so a new list is matched to the old one by
   * name rather than by place:
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
 * advances every element with the closed-form spring, so a long list is one loop. A spatial
 * list under reduced motion and `animate: false` jump, as {@link useM3SpringValue} does. On the server and in the
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
  // Keys name the elements only with one per target; otherwise elements match by place.
  const names = keys !== undefined && keys.length === targets.length ? keys : undefined;
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
    warned: boolean;
  }>({
    moves: [],
    pending: [],
    spring: SPRINGS.standard.spatial.default,
    tick: null,
    targets,
    keys: names,
    warned: false,
  });

  // Before the page is laid out, so marks that read an element by its index never draw a frame
  // from the old list (a list that changed length would put each one at its neighbour's place).
  useLayoutEffect(() => {
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
    if (process.env.NODE_ENV !== 'production' && keys !== undefined && !names && !current.warned) {
      current.warned = true;
      console.warn(
        '[@windmorph/react] useM3SpringValues: `keys` needs one key per target; matching by place.',
      );
    }
    if (!animated || (reducedMotion && family === 'spatial')) {
      current.targets = targets;
      current.keys = names;
      jump();
      return;
    }
    const spring = SPRINGS[reducedMotion ? 'standard' : motion][family][speed];
    const changed =
      !sameList(current.targets, targets) ||
      (names !== undefined && previousKeys !== undefined && !sameList(previousKeys, names));
    if (!changed) {
      current.keys = names;
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
    const scale = magnitude(targets);
    // Where each element is and how fast it moves now (not at the last frame).
    const states = value.get().map((position, index) => {
      const move = current.moves[index];
      return move ? stateAt(current.spring, move, now) : { value: position, velocity: 0 };
    });
    // Which old element each new one continues: by name, by place, or none (another length).
    const byName = names !== undefined && previousKeys?.length === states.length;
    const before = byName ? new Map(previousKeys.map((key, index) => [key, index])) : null;
    const sources = targets.map((_, index) =>
      before ? before.get(names![index]!) : states.length === targets.length ? index : undefined,
    );
    // `rest` as a function is asked only when an element is new, with the list as it shows.
    let restList: readonly number[] | undefined;
    const restAt = (index: number) => {
      if (typeof rest === 'number') return rest;
      if (typeof rest !== 'function') return rest[index] ?? 0;
      restList ??= rest(states.map((state) => state.value));
      return restList[index] ?? 0;
    };
    let positions: number[];
    let speeds: number[];
    if (byName || states.length === 0 || states.length === targets.length) {
      // A kept (or same-place) element carries on; a new one starts at rest.
      positions = sources.map((source, index) =>
        source === undefined ? restAt(index) : states[source]!.value,
      );
      speeds = sources.map((source) => (source === undefined ? 0 : states[source]!.velocity));
    } else {
      // Matched by place at another length: the old list read at the new length.
      positions = resample(
        states.map((state) => state.value),
        targets.length,
      );
      speeds = resample(
        states.map((state) => state.velocity),
        targets.length,
        0,
      );
    }
    // An element to or from something that isn't a number can't spring (it would stay NaN): it
    // lands on its target at once, still, as the single value does.
    targets.forEach((target, index) => {
      if (!Number.isFinite(target) || !Number.isFinite(positions[index]!)) {
        positions[index] = target;
        speeds[index] = 0;
      }
    });
    // An element at rest waits its delay, counted from when it first began to wait (a new target
    // while it waits doesn't restart it); one moving (past the settling speed) turns at once.
    const pending = targets.map((target, index) => {
      const source = sources[index];
      const waiting = source === undefined ? null : current.pending[source];
      const moving = Math.abs(speeds[index] ?? 0) > scale * 1e-3;
      const wait =
        target === positions[index] ? 0 : typeof delay === 'number' ? delay : (delay[index] ?? 0);
      const start = moving
        ? now
        : waiting && waiting.start > now
          ? waiting.start
          : now + wait * 1000;
      return { origin: 0, velocity: 0, target, start };
    });
    // Everything worked out (a `rest` that throws leaves the springs as they were); now take it.
    current.targets = targets;
    current.keys = names;
    current.spring = spring;
    current.moves = targets.map((_, index) => ({
      origin: positions[index]!,
      velocity: speeds[index] ?? 0,
      target: positions[index]!,
      start: now,
    }));
    current.pending = pending;
    value.set(positions);

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

  useLayoutEffect(
    () => () => {
      const current = state.current;
      if (current.tick) cancelFrame(current.tick);
      current.tick = null;
    },
    [],
  );

  return value;
}
