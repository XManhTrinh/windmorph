'use client';

import {
  useEffect,
  useRef,
  useState,
  type AriaAttributes,
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
import { densityAttribute, type Density } from '../../tokens/density';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { pickWidgetAria, splitRootProps, type WrapperRootDOMProps } from '../../utils/root-props';
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
  /** The thumb, the circle that slides along the track. */
  thumb?: string;
  /** The icon inside the thumb. */
  icon?: string;
  /** The round state layer around the thumb (hover, focus and press). */
  stateLayer?: string;
}

type RenamedAriaProps =
  | 'isSelected'
  | 'defaultSelected'
  | 'onChange'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'isInvalid'
  | 'children'
  // Left out: the deprecated `validationState` (`invalid` replaces it) and React Aria's
  // `excludeFromTabOrder` (`tabIndex={-1}` covers the rare case).
  | 'validationState'
  | 'excludeFromTabOrder';

interface SwitchOwnProps
  extends
    Omit<AriaSwitchProps, RenamedAriaProps>,
    Omit<WrapperRootDOMProps<HTMLLabelElement>, keyof AriaSwitchProps>,
    // The input's own state attributes go to it, with React Aria's `aria-controls`.
    Pick<AriaAttributes, 'aria-expanded' | 'aria-required' | 'aria-invalid' | 'aria-readonly'> {
  /** Controlled on state (`checked`, as an HTML checkbox). */
  checked?: boolean;
  /** Initial on state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called when the user switches it on or off. */
  onCheckedChange?: (checked: boolean) => void;
  /** Turns the switch off: it can't be changed or focused. @default false */
  disabled?: boolean;
  /** The switch can be focused but not changed. @default false */
  readOnly?: boolean;
  /**
   * The switch must be on (`aria-required`; with `validationBehavior="native"`, the form can't
   * submit until it is). @default false
   */
  required?: boolean;
  /** Marks the switch invalid for assistive tech (`aria-invalid`). @default false */
  invalid?: boolean;
  /** Shows the default check / close icons in the thumb. @default false */
  icons?: boolean;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the round state layer around the thumb
   * (40px at 0, 32px at -2 and -3, so it still shows around a pressed 28px thumb); the track
   * stays 52 × 32px and the touch target 48px. Left out, the switch takes the density of the
   * nearest `ThemeProvider` or `ThemeScope`. M3 asks for density to be the reader's choice
   * rather than a default, so prefer setting it there, from a setting.
   * @default 0
   */
  density?: Density;
  /** Icon in the thumb while checked (overrides the default check). */
  checkedIcon?: ReactNode;
  /** Icon in the thumb while unchecked (overrides the default close). */
  uncheckedIcon?: ReactNode;
  /** Classes for the root `<label>`, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: SwitchClassNames;
  /** Inline styles for the root `<label>`. */
  style?: CSSProperties;
  /** The root `<label>`. Use `inputRef` for the switch input. */
  ref?: Ref<HTMLLabelElement>;
  /** Ref to the visually hidden switch `<input>`. */
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
 * <Switch defaultChecked icons>Wi-Fi</Switch>
 */
export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  readOnly,
  required,
  invalid,
  icons = false,
  checkedIcon,
  uncheckedIcon,
  density,
  className,
  classNames,
  style,
  ref,
  inputRef,
  children,
  ...otherProps
}: SwitchProps) {
  // DOM attributes for the whole control go on the root; the rest goes to the input.
  const { root: data, rest } = splitRootProps(otherProps, { wrapper: true });
  const domInputRef = useObjectRef(inputRef);
  const options: AriaSwitchProps = {
    ...rest,
    children,
    isSelected: checked,
    defaultSelected: defaultChecked,
    onChange: onCheckedChange,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    isInvalid: invalid,
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
    ? (checkedIcon ?? (icons ? <CheckIcon /> : null))
    : (uncheckedIcon ?? (icons ? <CloseIcon /> : null));
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
    'data-checked': isSelected || undefined,
    'data-disabled': disabled || undefined,
    'data-hovered': (isHovered && !disabled) || undefined,
    'data-pressed': pressed || undefined,
    'data-dragged': dragging || undefined,
    'data-rippling': rippling || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-has-icon': Boolean(icon) || undefined,
  };
  const styles = switchStyles();
  // The track is the control; the switch's tokens name it as a part.
  const trackProps = { ...dragProps, 'data-slot': 'track' };

  return (
    <SelectionControl
      ref={ref}
      rootProps={mergeProps(labelProps, hoverProps)}
      inputProps={mergeProps(inputProps, pickWidgetAria(rest), focusProps, enterProps)}
      inputRef={domInputRef}
      rootData={{
        ...data,
        ...densityAttribute(density),
        'data-tokens': mergeDataTokens('md-comp-switch', data),
      }}
      state={stateAttributes}
      styles={styles}
      className={className}
      classNames={classNames}
      style={style}
      controlProps={trackProps}
      controlStyle={
        {
          '--m3-thumb-size': `${size}px`,
          '--m3-thumb-center': `${center}px`,
        } as CSSProperties
      }
      indicator={
        <>
          <span
            aria-hidden="true"
            {...stateAttributes}
            className={styles.stateLayer({ class: classNames?.stateLayer })}
          />
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
