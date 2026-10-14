'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useFocusRing,
  useHover,
  useObjectRef,
  useSwitch,
  type AriaSwitchProps,
} from 'react-aria';
import { useToggleState } from 'react-stately';
import {
  SelectionControl,
  type SelectionControlClassNames,
} from '../../primitives/SelectionControl';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { switchStyles } from './switch-styles';
import { restartRipple, useRippleHold } from '../../primitives/use-m3-interaction';
import {
  CheckIcon,
  CloseIcon,
  SwitchThumb,
  THUMB_OFF_CENTER,
  THUMB_ON_CENTER,
  thumbGeometry,
} from './switch-thumb';

export interface SwitchClassNames extends SelectionControlClassNames {
  thumb?: string;
  icon?: string;
}

type RenamedAriaProps =
  'isSelected' | 'defaultSelected' | 'onChange' | 'isDisabled' | 'isReadOnly' | 'children';

interface SwitchOwnProps extends Omit<AriaSwitchProps, RenamedAriaProps> {
  /** Controlled on state. */
  selected?: boolean;
  /** Initial on state when uncontrolled. */
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Shows the default check / close icons in the thumb. */
  icons?: boolean;
  /** Icon in the thumb while on (overrides the default check). */
  selectedIcon?: ReactNode;
  /** Icon in the thumb while off (overrides the default close). */
  unselectedIcon?: ReactNode;
  className?: string;
  classNames?: SwitchClassNames;
  style?: CSSProperties;
  /** The root `<label>`. Use `inputRef` for the switch input. */
  ref?: Ref<HTMLLabelElement>;
  inputRef?: Ref<HTMLInputElement>;
}

type SwitchLabel =
  | { children: ReactNode }
  | { children?: undefined; 'aria-label': string }
  | { children?: undefined; 'aria-labelledby': string };

export type SwitchProps = SwitchOwnProps & SwitchLabel;
/** How far (px) a press moves before it becomes a drag. */
const DRAG_SLOP = 3;

/** Whether a thumb dragged to `center` (px) is in the on half. */
const isOnAt = (center: number) => center > (THUMB_ON_CENTER + THUMB_OFF_CENTER) / 2;
/**
 * M3 switch: a track and a thumb that grows and slides when switched on (by a tap, a
 * drag, Space or Enter), optional icons in the thumb, a state layer that follows the
 * thumb and a 48px touch target.
 * A visually hidden native input with `role="switch"` (React Aria `useSwitch`) keeps
 * forms and assistive tech working.
 *
 * @example
 * <Switch defaultSelected icons>Wi-Fi</Switch>
 */
export function Switch({
  selected,
  defaultSelected,
  onSelectedChange,
  disabled = false,
  readOnly,
  icons = false,
  selectedIcon,
  unselectedIcon,
  className,
  classNames,
  style,
  ref,
  inputRef,
  children,
  ...otherProps
}: SwitchProps) {
  const { data, rest } = splitDataAttributes(otherProps);
  const domInputRef = useObjectRef(inputRef);
  const options: AriaSwitchProps = {
    ...rest,
    children,
    isSelected: selected,
    defaultSelected,
    onChange: onSelectedChange,
    isDisabled: disabled,
    isReadOnly: readOnly,
  };
  const toggleState = useToggleState(options);
  // Dragging the thumb (M3: "Touch: Tap, Drag"). The thumb follows the pointer between its
  // off and on centres; releasing sets the switch from the half the thumb is in. React
  // Aria's press then toggles on the click that follows, which `skipToggle` absorbs (it
  // lapses after React Aria's own 80ms click fallback, for a release outside the switch).
  const [dragCenter, setDragCenter] = useState<number | null>(null);
  const [skipToggle, setSkipToggle] = useState(false);
  const state = {
    ...toggleState,
    toggle: () => (skipToggle ? setSkipToggle(false) : toggleState.toggle()),
  };
  const stopDrag = useRef<(() => void) | null>(null);
  useEffect(() => () => stopDrag.current?.(), []);
  // Window listeners rather than React Aria `useMove`, which stops the pointer-down from
  // reaching the label's press handling (a tap on the track must still toggle).
  const dragProps = {
    onPointerDown: (event: PointerEvent<HTMLSpanElement>) => {
      if (event.button !== 0 || disabled || readOnly) return;
      const { pointerId } = event;
      const start = state.isSelected ? THUMB_ON_CENTER : THUMB_OFF_CENTER;
      const sign = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
      const startX = event.clientX;
      let center: number | null = null;
      const move = (moveEvent: globalThis.PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const offset = (moveEvent.clientX - startX) * sign;
        if (center === null && Math.abs(offset) < DRAG_SLOP) return;
        center = Math.min(THUMB_ON_CENTER, Math.max(THUMB_OFF_CENTER, start + offset));
        setDragCenter(center);
      };
      const remove = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        stopDrag.current = null;
      };
      const end = (endEvent: globalThis.PointerEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        remove();
        setDragCenter(null);
        if (center === null) return;
        if (endEvent.type !== 'pointerup') return;
        state.setSelected(isOnAt(center));
        setSkipToggle(true);
        setTimeout(() => setSkipToggle(false), 100);
      };
      stopDrag.current?.();
      stopDrag.current = remove;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    },
  };
  const { inputProps, labelProps, isSelected, isPressed } = useSwitch(options, state, domInputRef);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  const icon = isSelected
    ? (selectedIcon ?? (icons ? <CheckIcon /> : null))
    : (unselectedIcon ?? (icons ? <CloseIcon /> : null));
  // Browsers toggle a checkbox input on Space only; M3 also toggles a switch on Enter.
  // Enter presses like Space does: the thumb grows on key down and the switch toggles on
  // key up.
  const [enterPressed, setEnterPressed] = useState(false);
  const enterProps = {
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (event.repeat || disabled || readOnly) return;
      const control = event.currentTarget.closest<HTMLElement>('[data-selection-control]');
      if (control) restartRipple(control);
      setEnterPressed(true);
    },
    onKeyUp: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' || !enterPressed) return;
      setEnterPressed(false);
      toggleState.toggle();
    },
    onBlur: () => setEnterPressed(false),
  };
  const dragging = dragCenter !== null;
  const pressed = (isPressed || enterPressed || dragging) && !disabled;
  const rippling = useRippleHold(pressed);
  const geometry = thumbGeometry(isSelected, pressed, Boolean(icon));
  const { size } = geometry;
  const center = dragCenter ?? geometry.center;
  const stateAttributes = {
    'data-selected': isSelected || undefined,
    'data-disabled': disabled || undefined,
    'data-hovered': (isHovered && !disabled) || undefined,
    'data-pressed': pressed || undefined,
    'data-dragged': dragging || undefined,
    'data-rippling': rippling || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-has-icon': Boolean(icon) || undefined,
  };
  const styles = switchStyles();

  return (
    <SelectionControl
      ref={ref}
      rootProps={mergeProps(labelProps, hoverProps)}
      inputProps={mergeProps(inputProps, focusProps, enterProps)}
      inputRef={domInputRef}
      rootData={data}
      state={stateAttributes}
      styles={styles}
      className={className}
      classNames={classNames}
      style={style}
      controlProps={dragProps}
      controlStyle={
        {
          '--m3-thumb-size': `${size}px`,
          '--m3-thumb-center': `${center}px`,
        } as CSSProperties
      }
      indicator={
        <>
          <span aria-hidden="true" {...stateAttributes} className={styles.stateLayer()} />
          <SwitchThumb
            styles={styles}
            icon={icon}
            className={classNames?.thumb}
            iconClassName={classNames?.icon}
          />
        </>
      }
    >
      {children}
    </SelectionControl>
  );
}
