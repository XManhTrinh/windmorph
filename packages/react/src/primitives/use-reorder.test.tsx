import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReorder, type ReorderMove, type ReorderWhere } from './use-reorder';

const ROW = 40;

function List({
  initial = ['a', 'b', 'c', 'd'],
  fixed = [] as string[],
  onReorder,
}: {
  initial?: string[];
  fixed?: string[];
  onReorder?: (keys: string[], move: ReorderMove<string>) => void;
}) {
  const [keys, setKeys] = useState(initial);
  const listRef = useRef<HTMLUListElement>(null);
  const reorder = useReorder({
    keys,
    listRef,
    isMovable: (key) => !fixed.includes(key),
    onReorder: (next, move) => {
      onReorder?.(next, move);
      setKeys(next);
    },
  });
  return (
    <>
      <ul ref={listRef}>
        {keys.map((key) => (
          <li key={key} {...reorder.itemProps(key)}>
            <button type="button" {...reorder.handleProps(key)}>
              Move {key}
            </button>
            {(['up', 'down', 'top', 'bottom'] as ReorderWhere[]).map((where) => (
              <button
                key={where}
                type="button"
                disabled={!reorder.canMove(key, where)}
                onClick={() => reorder.move(key, where)}
              >
                {where} {key}
              </button>
            ))}
          </li>
        ))}
      </ul>
      <output data-testid="dragged">{reorder.dragged ?? ''}</output>
      <output data-testid="target">{reorder.target ?? ''}</output>
    </>
  );
}

const order = () => screen.getAllByRole('listitem').map((row) => row.dataset.reorderKey);
const handle = (key: string) => screen.getByRole('button', { name: `Move ${key}` });

/** jsdom lays nothing out: each row is ROW px tall, in its place in the list. */
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const row = this.closest('li');
    if (this.tagName === 'UL' || !row) return new DOMRect(0, 0, 300, ROW * 4);
    const index = Array.from(row.parentElement!.children).indexOf(row);
    return new DOMRect(0, index * ROW, 300, ROW);
  });
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const press = (key: string, y: number, extra: Partial<PointerEventInit> = {}) =>
  fireEvent.pointerDown(handle(key), {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    clientY: y,
    ...extra,
  });
const moveTo = (y: number, pointerId = 1) =>
  act(() => {
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId, clientY: y }));
  });
const release = (pointerId = 1) =>
  act(() => {
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId }));
  });

describe('useReorder', () => {
  it('lifts nothing under the threshold, and a press that doesn’t move reorders nothing', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    press('a', 20);
    moveTo(23);
    expect(screen.getByTestId('dragged')).toBeEmptyDOMElement();
    release();
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('lifts past the threshold, follows the pointer, and drops once with the new order', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    press('a', 20);
    moveTo(25);
    expect(screen.getByTestId('dragged')).toHaveTextContent('a');
    const row = screen.getAllByRole('listitem')[0]!;
    expect(row).toHaveAttribute('data-dragged', 'true');
    // Past the middle of the third row.
    moveTo(20 + ROW * 2 + 1);
    expect(screen.getByTestId('target')).toHaveTextContent('2');
    // The rows it passed moved up by its height.
    expect(screen.getAllByRole('listitem')[1]!.style.translate).toBe(`0 ${-ROW}px`);
    release();
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a', 'd'], { key: 'a', from: 0, to: 2 });
    expect(order()).toEqual(['b', 'c', 'a', 'd']);
  });

  it('is held inside the list', () => {
    render(<List />);
    press('b', ROW + 20);
    moveTo(ROW + 20 + 1000);
    expect(screen.getByTestId('target')).toHaveTextContent('3');
    expect(screen.getAllByRole('listitem')[1]!.style.translate).toBe(`0 ${ROW * 2}px`);
  });

  it('puts the row back on Escape, a cancelled pointer and the window losing focus', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    for (const end of [
      () => fireEvent.keyDown(window, { key: 'Escape' }),
      () => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 })),
      () => window.dispatchEvent(new Event('blur')),
    ]) {
      press('a', 20);
      moveTo(20 + ROW * 2);
      act(end);
      expect(screen.getByTestId('dragged')).toBeEmptyDOMElement();
      release();
    }
    expect(onReorder).not.toHaveBeenCalled();
    expect(order()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('ignores a secondary button and a second contact', () => {
    render(<List />);
    press('a', 20, { button: 2 });
    moveTo(100);
    expect(screen.getByTestId('dragged')).toBeEmptyDOMElement();
    press('a', 20, { isPrimary: false, pointerId: 2 });
    moveTo(100, 2);
    expect(screen.getByTestId('dragged')).toBeEmptyDOMElement();
  });

  it('stops at a row that can’t move, and its own handle starts nothing', () => {
    render(<List fixed={['c']} />);
    press('a', 20);
    moveTo(20 + ROW * 3);
    expect(screen.getByTestId('target')).toHaveTextContent('1');
    release();
    press('c', ROW * 2 + 20);
    moveTo(10);
    expect(screen.getByTestId('dragged')).toBeEmptyDOMElement();
  });

  it('moves by action, and says which moves lead somewhere', () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} fixed={['d']} />);
    expect(screen.getByRole('button', { name: 'up a' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'down c' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'bottom a' }));
    expect(onReorder).toHaveBeenLastCalledWith(['b', 'c', 'a', 'd'], { key: 'a', from: 0, to: 2 });
    fireEvent.click(screen.getByRole('button', { name: 'top a' }));
    expect(order()).toEqual(['a', 'b', 'c', 'd']);
    fireEvent.click(screen.getByRole('button', { name: 'down b' }));
    expect(order()).toEqual(['a', 'c', 'b', 'd']);
  });
});
