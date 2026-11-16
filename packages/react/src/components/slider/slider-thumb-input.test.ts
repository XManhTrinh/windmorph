import { describe, expect, it, vi } from 'vitest';
import type { SliderState } from 'react-stately';
import { sliderArrowRaises, sliderThumbInputProps } from './slider-thumb-input';

describe('sliderArrowRaises', () => {
  it('raises with ↑ and the forward arrow, mirrored right to left', () => {
    expect(sliderArrowRaises('ArrowUp', 'ltr')).toBe(true);
    expect(sliderArrowRaises('ArrowRight', 'ltr')).toBe(true);
    expect(sliderArrowRaises('ArrowLeft', 'ltr')).toBe(false);
    expect(sliderArrowRaises('ArrowDown', 'rtl')).toBe(false);
    expect(sliderArrowRaises('ArrowLeft', 'rtl')).toBe(true);
    expect(sliderArrowRaises('ArrowRight', 'rtl')).toBe(false);
    expect(sliderArrowRaises('PageUp', 'ltr')).toBeUndefined();
  });
});

describe('sliderThumbInputProps', () => {
  const state = { setThumbDragging: vi.fn() } as unknown as SliderState;

  it('names the thumb by the visible label rather than through the group', () => {
    const props = sliderThumbInputProps(
      { 'aria-labelledby': 'group-1 thumb-1', 'aria-describedby': '', 'aria-details': '' },
      { state, index: 0, groupId: 'group-1', labelledBy: ' label-1  label-2 ' },
    );
    expect(props['aria-labelledby']).toBe('label-1 label-2 thumb-1');
    expect(props['aria-describedby']).toBeUndefined();
    expect(props['aria-details']).toBeUndefined();
  });

  it('keeps React Aria’s naming when the group has an aria-label', () => {
    const props = sliderThumbInputProps(
      { 'aria-labelledby': 'group-1' },
      { state, index: 0, groupId: 'group-1', labelledBy: undefined },
    );
    expect(props['aria-labelledby']).toBe('group-1');
  });

  it('wraps a change of the native input in a drag, so it is committed', () => {
    const calls: string[] = [];
    const tracked = {
      setThumbDragging: (index: number, dragging: boolean) => calls.push(`${index}:${dragging}`),
    } as unknown as SliderState;
    const onChange = vi.fn(() => calls.push('change'));
    const props = sliderThumbInputProps(
      { onChange },
      { state: tracked, index: 1, groupId: 'g', labelledBy: undefined },
    );
    props.onChange?.({} as never);
    expect(calls).toEqual(['1:true', 'change', '1:false']);
  });
});
