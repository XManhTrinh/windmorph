'use client';

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import {
  mergeProps,
  mergeRefs,
  useFocusRing,
  useHover,
  useObjectRef,
  useRadio,
  useRadioGroup,
  type AriaRadioGroupProps,
  type AriaRadioProps,
} from 'react-aria';
import { useRadioGroupState, type RadioGroupState } from 'react-stately';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { ErrorText, SupportingText } from '../../primitives/Field';
import {
  SelectionControl,
  type SelectionControlClassNames,
} from '../../primitives/SelectionControl';
import { densityAttribute, type Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { radioGroupStyles, radioStyles } from './radio-styles';
import { useRippleHold } from '../../primitives/use-m3-interaction';
import { RadioRing } from './radio-ring';

const RadioGroupContext = createContext<RadioGroupState | null>(null);

export interface RadioGroupClassNames {
  /** The group's outer element. */
  root?: string;
  /** The visible group label. */
  label?: string;
  /** The wrapper around the radio buttons. */
  options?: string;
  /** The helper text below the options. */
  supportingText?: string;
  /** The error message, shown in place of the helper text while invalid. */
  errorText?: string;
}

type RenamedGroupProps =
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'isInvalid'
  | 'description'
  | 'label'
  | 'onChange'
  // The deprecated `validationState` is left out: `invalid` replaces it.
  | 'validationState';

interface RadioGroupOwnProps extends Omit<AriaRadioGroupProps, RenamedGroupProps> {
  /** Visible group label. */
  label?: ReactNode;
  /** Helper text below the options. */
  supportingText?: ReactNode;
  /** Called with the selected option's value when the selection changes. */
  onChange?: (value: string) => void;
  /** Turns every option off: none can be selected or focused. @default false */
  disabled?: boolean;
  /** The options can be focused but the selection can't change. @default false */
  readOnly?: boolean;
  /** An option must be selected before the form submits. @default false */
  required?: boolean;
  /** Shows the error state. @default false */
  invalid?: boolean;
  /**
   * Web density, `0` to `-3`, for every option: each step takes 4px off their round state
   * layers (40px at 0, 28px at -3) and puts 2px more between rows, so each option keeps a
   * 48px touch target that never reaches the next one's ring. Left out, the group takes the
   * density of the nearest `ThemeProvider` or `ThemeScope`; M3 asks for density to be the
   * reader's choice, so prefer setting it there.
   * @default 0
   */
  density?: Density;
  /** The options: `Radio` elements. */
  children?: ReactNode;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: RadioGroupClassNames;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Ref to the root `<div>` element. */
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
export function RadioGroup(props: RadioGroupProps) {
  // React Aria swaps ← / → by the locale's direction, so a horizontal group in an RTL region
  // under an LTR locale would move the wrong way; the laid-out direction drives it instead.
  return (
    <DomDirectionLocale>
      {(directionRef) => <RadioGroupRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/**
 * Arrow keys on a radio stay in the group (WAI-ARIA APG: they wrap). With one radio React
 * Aria finds nowhere to move and leaves the key alone, so it scrolled the page (2026-10-15).
 */
function keepArrowKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || !ARROW_KEYS.has(event.key)) return;
  if ((event.target as Element).matches('input[type="radio"]')) event.preventDefault();
}

function RadioGroupRoot({
  label,
  supportingText,
  errorMessage,
  onChange,
  disabled = false,
  readOnly,
  required,
  invalid,
  density,
  orientation = 'vertical',
  children,
  className,
  classNames,
  style,
  ref,
  directionRef,
  ...otherProps
}: RadioGroupProps & { directionRef: RefCallback<HTMLElement> }) {
  const { data, rest } = splitDataAttributes(otherProps);
  const rootRef = useMemo(
    () => mergeRefs<HTMLDivElement>(ref, directionRef as RefCallback<HTMLDivElement>),
    [ref, directionRef],
  );
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
      {...mergeProps(radioGroupProps, { onKeyDown: keepArrowKeys })}
      ref={rootRef}
      style={style}
      data-orientation={orientation}
      {...densityAttribute(density)}
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
  /** The outer ring. */
  ring?: string;
  /** The dot inside the ring while selected. */
  dot?: string;
}

interface RadioOwnProps extends Omit<AriaRadioProps, 'isDisabled' | 'children'> {
  /** The value this option selects. */
  value: string;
  /** Turns this option off: it can't be selected or focused. @default false */
  disabled?: boolean;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the round state layer (40px at 0, 28px
   * at -3); the ring stays 20px and the touch target 48px. Left out, the option takes its
   * group's density, or the nearest `ThemeProvider`'s or `ThemeScope`'s.
   * @default 0
   */
  density?: Density;
  /** Classes for the root `<label>`, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: RadioClassNames;
  /** Inline styles for the root `<label>`. */
  style?: CSSProperties;
  /** The root `<label>`. Use `inputRef` for the radio input. */
  ref?: Ref<HTMLLabelElement>;
  /** Ref to the visually hidden radio `<input>`. */
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
  density,
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
      // The ring resolves the component tokens itself (list items draw it too); the root
      // is marked as well, so the tokens sit on the element that carries the state.
      rootData={{
        ...data,
        ...densityAttribute(density),
        'data-tokens': mergeDataTokens('md-comp-radio-button', data),
      }}
      state={{
        'data-checked': isSelected || undefined,
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
