'use client';

import type { CSSProperties, ReactNode, Ref } from 'react';
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
import { useRippleHold } from '../../primitives/use-m3-interaction';

export const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

export const CloseIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

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

/** Thumb size and centre in px (Compose `ThumbNode`). */
export function thumbGeometry(selected: boolean, pressed: boolean, hasIcon: boolean) {
  const size = pressed ? 28 : selected || hasIcon ? 24 : 16;
  return { size, center: selected ? 36 : 16 };
}

/**
 * M3 switch: a track and a thumb that grows and slides when switched on, optional
 * icons in the thumb, a state layer that follows the thumb and a 48px touch target.
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
  const state = useToggleState(options);
  const { inputProps, labelProps, isSelected, isPressed } = useSwitch(options, state, domInputRef);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  const icon = isSelected
    ? (selectedIcon ?? (icons ? <CheckIcon /> : null))
    : (unselectedIcon ?? (icons ? <CloseIcon /> : null));
  const pressed = isPressed && !disabled;
  const rippling = useRippleHold(pressed);
  const { size, center } = thumbGeometry(isSelected, pressed, Boolean(icon));
  const stateAttributes = {
    'data-selected': isSelected || undefined,
    'data-disabled': disabled || undefined,
    'data-hovered': (isHovered && !disabled) || undefined,
    'data-pressed': pressed || undefined,
    'data-rippling': rippling || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-has-icon': Boolean(icon) || undefined,
  };
  const styles = switchStyles();

  return (
    <SelectionControl
      ref={ref}
      rootProps={mergeProps(labelProps, hoverProps)}
      inputProps={mergeProps(inputProps, focusProps)}
      inputRef={domInputRef}
      rootData={data}
      state={stateAttributes}
      styles={styles}
      className={className}
      classNames={classNames}
      style={style}
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

/**
 * The thumb and its optional icon, placed by `--m3-thumb-size` and `--m3-thumb-center` on
 * the track and styled from a `group/control` ancestor's state attributes. Shared with
 * list items that are switches.
 */
export function SwitchThumb({
  styles = switchStyles(),
  icon,
  className,
  iconClassName,
}: {
  styles?: ReturnType<typeof switchStyles>;
  icon?: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={styles.thumb({ class: className })}>
      {icon && <span className={styles.icon({ class: iconClassName })}>{icon}</span>}
    </span>
  );
}
