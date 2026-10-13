'use client';

import { createContext, useContext, type CSSProperties, type ReactNode, type Ref } from 'react';
import {
  mergeProps,
  useFocusRing,
  useHover,
  useObjectRef,
  useRadio,
  useRadioGroup,
  type AriaRadioGroupProps,
  type AriaRadioProps,
} from 'react-aria';
import { useRadioGroupState, type RadioGroupState } from 'react-stately';
import { ErrorText, SupportingText } from '../../primitives/Field';
import {
  SelectionControl,
  type SelectionControlClassNames,
} from '../../primitives/SelectionControl';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { radioGroupStyles, radioStyles } from './radio-styles';
import { useRippleHold } from '../../primitives/use-m3-interaction';

const RadioGroupContext = createContext<RadioGroupState | null>(null);

export interface RadioGroupClassNames {
  root?: string;
  label?: string;
  options?: string;
  supportingText?: string;
  errorText?: string;
}

type RenamedGroupProps =
  'isDisabled' | 'isReadOnly' | 'isRequired' | 'isInvalid' | 'description' | 'label' | 'onChange';

interface RadioGroupOwnProps extends Omit<AriaRadioGroupProps, RenamedGroupProps> {
  /** Visible group label. */
  label?: ReactNode;
  /** Helper text below the options. */
  supportingText?: ReactNode;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  children?: ReactNode;
  className?: string;
  classNames?: RadioGroupClassNames;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

type GroupLabel =
  | { label: ReactNode }
  | { label?: undefined; 'aria-label': string }
  | { label?: undefined; 'aria-labelledby': string };

export type RadioGroupProps = RadioGroupOwnProps & GroupLabel;

/**
 * A set of radio buttons with one selection. Provides the selection state, arrow-key
 * navigation, the group label, supporting text and validation (React Aria `useRadioGroup`).
 *
 * @example
 * <RadioGroup label="Delivery" defaultValue="standard" name="delivery">
 *   <Radio value="standard">Standard</Radio>
 *   <Radio value="express">Express</Radio>
 * </RadioGroup>
 */
export function RadioGroup({
  label,
  supportingText,
  errorMessage,
  onChange,
  disabled = false,
  readOnly,
  required,
  invalid,
  orientation = 'vertical',
  children,
  className,
  classNames,
  style,
  ref,
  ...otherProps
}: RadioGroupProps) {
  const { data, rest } = splitDataAttributes(otherProps);
  const options: AriaRadioGroupProps = {
    ...rest,
    label,
    description: supportingText,
    errorMessage,
    onChange,
    orientation,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    isInvalid: invalid,
  };
  const state = useRadioGroupState(options);
  const {
    radioGroupProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  } = useRadioGroup(options, state);

  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors, validationDetails })
      : (errorMessage ?? validationErrors.join(' '));
  const styles = radioGroupStyles({ orientation, disabled });

  return (
    <div
      {...data}
      {...radioGroupProps}
      ref={ref}
      style={style}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {label !== undefined && label !== null && (
        <span {...labelProps} className={styles.label({ class: classNames?.label })}>
          {label}
        </span>
      )}
      <div className={styles.options({ class: classNames?.options })}>
        <RadioGroupContext value={state}>{children}</RadioGroupContext>
      </div>
      {supportingText && !(isInvalid && resolvedError) && (
        <SupportingText
          {...descriptionProps}
          className={styles.supporting({ class: classNames?.supportingText })}
        >
          {supportingText}
        </SupportingText>
      )}
      {isInvalid && resolvedError && (
        <ErrorText
          {...errorMessageProps}
          className={styles.supporting({ class: classNames?.errorText })}
        >
          {resolvedError}
        </ErrorText>
      )}
    </div>
  );
}

export interface RadioClassNames extends SelectionControlClassNames {
  ring?: string;
  dot?: string;
}

interface RadioOwnProps extends Omit<AriaRadioProps, 'isDisabled' | 'children'> {
  /** The value this option selects. */
  value: string;
  disabled?: boolean;
  className?: string;
  classNames?: RadioClassNames;
  style?: CSSProperties;
  /** The root `<label>`. Use `inputRef` for the radio input. */
  ref?: Ref<HTMLLabelElement>;
  inputRef?: Ref<HTMLInputElement>;
}

type RadioLabel =
  | { children: ReactNode }
  | { children?: undefined; 'aria-label': string }
  | { children?: undefined; 'aria-labelledby': string };

export type RadioProps = RadioOwnProps & RadioLabel;

/**
 * M3 radio button: a 20px ring whose dot grows when selected, with a 40px state layer
 * and a 48px touch target. Must be rendered inside a `RadioGroup`.
 */
export function Radio({
  disabled = false,
  className,
  classNames,
  style,
  ref,
  inputRef,
  children,
  ...otherProps
}: RadioProps) {
  const state = useContext(RadioGroupContext);
  if (!state) throw new Error('[@windmorph/react] <Radio> must be used inside <RadioGroup>.');
  const { data, rest } = splitDataAttributes(otherProps);
  const domInputRef = useObjectRef(inputRef);
  const { inputProps, labelProps, isSelected, isDisabled, isPressed } = useRadio(
    { ...rest, children, isDisabled: disabled },
    state,
    domInputRef,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const rippling = useRippleHold(isPressed && !isDisabled);
  const styles = radioStyles();

  return (
    <SelectionControl
      ref={ref}
      rootProps={mergeProps(labelProps, hoverProps)}
      inputProps={mergeProps(inputProps, focusProps)}
      inputRef={domInputRef}
      rootData={data}
      state={{
        'data-selected': isSelected || undefined,
        'data-disabled': isDisabled || undefined,
        'data-hovered': (isHovered && !isDisabled) || undefined,
        'data-pressed': (isPressed && !isDisabled) || undefined,
        'data-rippling': rippling || undefined,
        'data-focus-visible': isFocusVisible || undefined,
      }}
      styles={styles}
      className={className}
      classNames={classNames}
      style={style}
      indicator={
        <RadioRing styles={styles} className={classNames?.ring} dotClassName={classNames?.dot} />
      }
    >
      {children}
    </SelectionControl>
  );
}

/**
 * The drawn ring and dot, styled from a `group/control` ancestor's state attributes.
 * Shared with list items that are radio buttons.
 */
export function RadioRing({
  styles = radioStyles(),
  className,
  dotClassName,
}: {
  styles?: ReturnType<typeof radioStyles>;
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={styles.ring({ class: className })}>
      <span className={styles.dot({ class: dotClassName })} />
    </span>
  );
}
