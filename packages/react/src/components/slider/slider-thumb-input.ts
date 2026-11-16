import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { SliderState } from 'react-stately';

// Whether each arrow key raises the value (true) or lowers it (false), by direction: up and
// the reading direction's forward arrow raise it, as React Aria's keys do.
const RAISING_KEYS: Record<'ltr' | 'rtl', Record<string, boolean>> = {
  ltr: { ArrowRight: true, ArrowUp: true, ArrowLeft: false, ArrowDown: false },
  rtl: { ArrowLeft: true, ArrowUp: true, ArrowRight: false, ArrowDown: false },
};

/**
 * Whether an arrow key raises a slider's value (`true`), lowers it (`false`), or isn't an
 * arrow key (`undefined`), in the given reading direction: ↑ and the forward arrow (→, or ←
 * right to left) raise it, as React Aria's slider keys do. For a slider that handles its own
 * arrow steps, such as one moving a fixed amount per key whatever its drag precision.
 */
export function sliderArrowRaises(key: string, direction: 'ltr' | 'rtl'): boolean | undefined {
  return RAISING_KEYS[direction][key];
}

/** What {@link sliderThumbInputProps} needs besides React Aria's thumb input props. */
export interface SliderThumbInputOptions {
  /** The slider state the thumb belongs to (React Stately's `useSliderState`). */
  state: SliderState;
  /** The thumb's index in `state.values`. */
  index: number;
  /** The id of the slider's group (`useSlider`'s `groupProps.id`), which names each thumb. */
  groupId: string | undefined;
  /** The ids that name the group (`aria-labelledby`), when a visible label names it. */
  labelledBy: string | undefined;
}

/**
 * React Aria's thumb input props (`useSliderThumb`'s `inputProps`) made right for assistive
 * technology, for a slider built on React Aria's hooks:
 *
 * - **Named by a visible label.** React Aria names each thumb by the group
 *   (`aria-labelledby` → the group's id), but a name is never followed through a second
 *   `aria-labelledby`, so a group named by a visible label left the thumb named by its own
 *   value text. The thumb points at the label itself, as the group does; an `aria-label` on
 *   the group is read through it as is.
 * - **No empty descriptions.** React Aria joins the description's ids into an empty string
 *   when there are none.
 * - **A value set by assistive technology is committed.** A screen reader's increment
 *   (VoiceOver's swipe, a form reset) changes the native input, which React Aria passes to the
 *   state with no drag around it, so `onChangeEnd` never came: the change is committed as a
 *   key's is.
 */
export function sliderThumbInputProps(
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  { state, index, groupId, labelledBy }: SliderThumbInputOptions,
): InputHTMLAttributes<HTMLInputElement> {
  const ids = labelledBy?.trim();
  return {
    ...inputProps,
    'aria-labelledby': ids
      ? inputProps['aria-labelledby']
          ?.split(' ')
          .flatMap((id) => (id === groupId ? ids.split(/\s+/) : [id]))
          .join(' ')
      : inputProps['aria-labelledby'],
    'aria-describedby': inputProps['aria-describedby'] || undefined,
    'aria-details': inputProps['aria-details'] || undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      state.setThumbDragging(index, true);
      inputProps.onChange?.(event);
      state.setThumbDragging(index, false);
    },
  };
}
