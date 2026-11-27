import { act, renderHook } from '@testing-library/react';
import type { TransitionEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LEGACY_DURATIONS, SPRINGS, springSettleDuration } from '../tokens/motion';
import { EXIT_FALLBACK_MS, usePresence } from './use-presence';

describe('usePresence', () => {
  it('waits longer than the slowest spring token plus the longest exit delay', () => {
    const slowest = Math.max(
      ...Object.values(SPRINGS).flatMap((scheme) =>
        Object.values(scheme).flatMap((family) => Object.values(family).map(springSettleDuration)),
      ),
    );
    // The dialog's container fade waits `short-2` for its parts to fade first.
    expect(EXIT_FALLBACK_MS).toBeGreaterThan(slowest + LEGACY_DURATIONS['short-2']);
  });

  it('stays present until the exit transition ends, or the fallback', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current).toMatchObject({ isPresent: true, isExiting: true });
    act(() => vi.advanceTimersByTime(EXIT_FALLBACK_MS - 1));
    expect(result.current.isPresent).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.isPresent).toBe(false);
    vi.useRealTimers();
  });

  it('ends on the first of several properties to finish its transition', () => {
    const { result, rerender } = renderHook(
      ({ open }) => usePresence(open, ['translate', 'opacity']),
      { initialProps: { open: true } },
    );
    rerender({ open: false });
    const element = document.createElement('div');
    const end = (propertyName: string) =>
      act(() =>
        result.current.exitProps.onTransitionEnd({
          target: element,
          currentTarget: element,
          propertyName,
        } as unknown as TransitionEvent<HTMLElement>),
      );
    end('color');
    expect(result.current.isPresent).toBe(true);
    end('opacity');
    expect(result.current.isPresent).toBe(false);
  });

  describe('with other transitions still running as the exit ends', () => {
    function setUp() {
      const { result, rerender } = renderHook(({ open }) => usePresence(open), {
        initialProps: { open: true },
      });
      rerender({ open: false });
      const element = document.createElement('div');
      const child = element.appendChild(document.createElement('div'));
      // As a browser does, a cancelled transition sends its event a frame or two later.
      const cancelled = (target: Element, propertyName: string) => () =>
        setTimeout(() =>
          target.dispatchEvent(
            Object.assign(new Event('transitioncancel', { bubbles: true }), { propertyName }),
          ),
        );
      const transition = (target: Element, transitionProperty: string, playState: string) => ({
        transitionProperty,
        playState,
        effect: { target },
        cancel: vi.fn(cancelled(target, transitionProperty)),
      });
      const reveal = transition(element, 'clip-path', 'running');
      const label = transition(child, 'color', 'running');
      const done = transition(element, 'opacity', 'finished');
      const spinner = { animationName: 'spin', playState: 'running', cancel: vi.fn() };
      const getAnimations = vi.fn(() => [reveal, label, done, spinner] as unknown as Animation[]);
      element.getAnimations = getAnimations;
      const end = () =>
        act(() =>
          result.current.exitProps.onTransitionEnd({
            target: element,
            currentTarget: element,
            propertyName: 'opacity',
          } as unknown as TransitionEvent<HTMLElement>),
        );
      return { result, rerender, end, getAnimations, reveal, label, done, spinner };
    }
    const sent = () => act(() => new Promise((resolve) => setTimeout(resolve)));

    it("cancels them, and leaves once they've said so, so React Aria never keeps the element", async () => {
      const { result, end, getAnimations, reveal, label, done, spinner } = setUp();
      end();
      expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
      expect(reveal.cancel).toHaveBeenCalledOnce();
      expect(label.cancel).toHaveBeenCalledOnce();
      // Only transitions still running: a finished one and a CSS animation are left alone.
      expect(done.cancel).not.toHaveBeenCalled();
      expect(spinner.cancel).not.toHaveBeenCalled();
      expect(result.current.isPresent).toBe(true);
      await sent();
      expect(result.current.isPresent).toBe(false);
    });

    it('stays when it opens again before they have', async () => {
      const { result, rerender, end } = setUp();
      end();
      rerender({ open: true });
      await sent();
      expect(result.current).toMatchObject({ isPresent: true, isExiting: false });
    });
  });

  it('follows the open state at once when not animated', () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 'opacity', false), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current).toMatchObject({ isPresent: false, isExiting: false });
  });
});
