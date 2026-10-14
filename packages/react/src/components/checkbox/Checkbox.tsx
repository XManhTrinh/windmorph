'use client';

import type { CSSProperties, ReactNode, Ref } from 'react';
import {
  mergeProps,
  useCheckbox,
  useFocusRing,
  useHover,
  useObjectRef,
  type AriaCheckboxProps,
} from 'react-aria';
import { useToggleState } from 'react-stately';
import {
  SelectionControl,
  type SelectionControlClassNames,
} from '../../primitives/SelectionControl';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { checkboxStyles } from './checkbox-styles';
import { useRippleHold } from '../../primitives/use-m3-interaction';
import { CheckboxBox } from './checkbox-box';

export interface CheckboxClassNames extends SelectionControlClassNames {
  /** The 18px box that draws the check mark or dash. */
  box?: string;
  /** The check or dash drawn in the box (an `<svg>` stroked with `currentColor`). */
  icon?: string;
}

/** React Aria names with an `is` prefix; we use the shorter HTML-style names. */
type RenamedAriaProps =
  | 'isSelected'
  | 'defaultSelected'
  | 'onChange'
  | 'isIndeterminate'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'isInvalid'
  | 'children';

interface CheckboxOwnProps extends Omit<AriaCheckboxProps, RenamedAriaProps> {
  /** Controlled checked state. */
  selected?: boolean;
  /** Initial checked state when uncontrolled. */
  defaultSelected?: boolean;
  /** Called when the user checks or unchecks the checkbox. */
  onSelectedChange?: (selected: boolean) => void;
  /** Shows a dash: some, but not all, of a group is checked. Purely visual. @default false */
  indeterminate?: boolean;
  /** Turns the checkbox off: it can't be changed or focused. @default false */
  disabled?: boolean;
  /** The checkbox can be focused but not changed. @default false */
  readOnly?: boolean;
  /** The checkbox must be checked before its form submits. @default false */
  required?: boolean;
  /** Shows the error state. @default false */
  invalid?: boolean;
  /** Classes for the root `<label>`, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: CheckboxClassNames;
  /** Inline styles for the root `<label>`. */
  style?: CSSProperties;
  /** The root `<label>`. Use `inputRef` for the checkbox input. */
  ref?: Ref<HTMLLabelElement>;
  /** Ref to the visually hidden checkbox `<input>`. */
  inputRef?: Ref<HTMLInputElement>;
}

/** A visible label, or an accessible name for a checkbox without one. */
type CheckboxLabel =
  | { children: ReactNode }
  | { children?: undefined; 'aria-label': string }
  | { children?: undefined; 'aria-labelledby': string };

export type CheckboxProps = CheckboxOwnProps & CheckboxLabel;

/**
 * M3 checkbox: checked, unchecked and indeterminate, with error and disabled states, a
 * drawn check mark, a 40px state layer and a 48px touch target. A visually hidden native
 * checkbox (React Aria `useCheckbox`) keeps forms, labels and assistive tech working.
 *
 * @example
 * <Checkbox defaultSelected name="terms" required>I accept the terms</Checkbox>
 */
export function Checkbox({
  selected,
  defaultSelected,
  onSelectedChange,
  indeterminate = false,
  disabled = false,
  readOnly,
  required,
  invalid,
  className,
  classNames,
  style,
  ref,
  inputRef,
  children,
  ...otherProps
}: CheckboxProps) {
  // `data-*` attributes go on the root; everything else goes to the input via React Aria.
  const { data: rootData, rest: ariaProps } = splitDataAttributes(otherProps);
  const domInputRef = useObjectRef(inputRef);
  const options: AriaCheckboxProps = {
    ...ariaProps,
    children,
    isSelected: selected,
    defaultSelected,
    onChange: onSelectedChange,
    isIndeterminate: indeterminate,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    isInvalid: invalid,
  };
  const state = useToggleState(options);
  const { inputProps, labelProps, isSelected, isPressed, isInvalid } = useCheckbox(
    options,
    state,
    domInputRef,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  const filled = isSelected || indeterminate;
  const rippling = useRippleHold(isPressed && !disabled);
  const styles = checkboxStyles();

  return (
    <SelectionControl
      ref={ref}
      rootProps={mergeProps(labelProps, hoverProps)}
      inputProps={mergeProps(inputProps, focusProps)}
      inputRef={domInputRef}
      // The box resolves the component tokens itself (list items draw it too); the root
      // is marked as well, so the tokens sit on the element that carries the state.
      rootData={{ ...rootData, 'data-tokens': 'md-comp-checkbox' }}
      state={{
        'data-selected': filled || undefined,
        'data-checked': (isSelected && !indeterminate) || undefined,
        'data-indeterminate': indeterminate || undefined,
        'data-invalid': isInvalid || undefined,
        'data-disabled': disabled || undefined,
        'data-hovered': (isHovered && !disabled) || undefined,
        'data-pressed': (isPressed && !disabled) || undefined,
        'data-rippling': rippling || undefined,
        'data-focus-visible': isFocusVisible || undefined,
      }}
      styles={styles}
      className={className}
      classNames={classNames}
      style={style}
      indicator={
        <CheckboxBox styles={styles} className={classNames?.box} iconClassName={classNames?.icon} />
      }
    >
      {children}
    </SelectionControl>
  );
}
