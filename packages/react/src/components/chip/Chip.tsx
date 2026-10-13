'use client';

import { useId, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { TouchTarget } from '../../primitives/TouchTarget';
import { cn } from '../../utils/cn';
import { chipStyles } from './chip-styles';

/** Material Symbols "check" and "close" (Apache-2.0). */
function CheckIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export interface ChipClassNames {
  root?: string;
  content?: string;
  leading?: string;
  label?: string;
  trailing?: string;
}

interface ChipCommonProps {
  /** The label. */
  children: ReactNode;
  /** Icon before the label (18px). Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  classNames?: ChipClassNames;
}

type Styles = ReturnType<typeof chipStyles>;

function ChipContent({
  styles,
  classNames,
  leading,
  children,
  trailing,
}: {
  styles: Styles;
  classNames?: ChipClassNames;
  leading?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <span className={styles.content({ class: classNames?.content })}>
      <TouchTarget />
      {leading}
      <span className={styles.label({ class: classNames?.label })}>{children}</span>
      {trailing}
    </span>
  );
}

const leadingIconOf = (styles: Styles, icon: ReactElement | undefined, className?: string) =>
  icon && (
    <span aria-hidden="true" className={styles.leading({ class: className })}>
      {icon}
    </span>
  );

/* ------------------------------------------------------------------ Assist */

interface AssistChipOwnProps extends ChipCommonProps {
  /** Icon after the label. Hidden from assistive tech. */
  trailingIcon?: ReactElement;
  /** `surface-container-low` at level 1 instead of an outline. */
  elevated?: boolean;
}

type OmitChip<T> = Omit<T, keyof AssistChipOwnProps | 'toggle'>;

export type AssistChipProps = AssistChipOwnProps &
  (OmitChip<ButtonBaseActionProps> | OmitChip<ButtonBaseLinkProps>);

/**
 * M3 assist chip: a smart or automated action that can span apps, such as opening a calendar
 * event. A button, or a link with `href`.
 *
 * @example
 * <AssistChip leadingIcon={<EventIcon />} onPress={addToCalendar}>Add to calendar</AssistChip>
 */
export function AssistChip({
  children,
  leadingIcon,
  trailingIcon,
  elevated,
  classNames,
  className,
  ...base
}: AssistChipProps) {
  const styles = chipStyles({
    kind: 'assist',
    elevated,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: Boolean(trailingIcon),
  });
  return (
    <ButtonBase
      {...(base as ButtonBaseActionProps)}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ChipContent
        styles={styles}
        classNames={classNames}
        leading={leadingIconOf(styles, leadingIcon, classNames?.leading)}
        trailing={
          trailingIcon && (
            <span aria-hidden="true" className={styles.trailing({ class: classNames?.trailing })}>
              {trailingIcon}
            </span>
          )
        }
      >
        {children}
      </ChipContent>
    </ButtonBase>
  );
}

/* -------------------------------------------------------------- Suggestion */

interface SuggestionChipOwnProps extends ChipCommonProps {
  elevated?: boolean;
}

export type SuggestionChipProps = SuggestionChipOwnProps &
  Omit<ButtonBaseActionProps, keyof SuggestionChipOwnProps | 'toggle'>;

/**
 * M3 suggestion chip: a dynamically generated suggestion, such as a reply. Use an icon
 * sparingly.
 *
 * @example
 * <SuggestionChip onPress={() => reply('Sounds good')}>Sounds good</SuggestionChip>
 */
export function SuggestionChip({
  children,
  leadingIcon,
  elevated,
  classNames,
  className,
  ...base
}: SuggestionChipProps) {
  const styles = chipStyles({
    kind: 'suggestion',
    elevated,
    leading: leadingIcon ? 'icon' : 'none',
  });
  return (
    <ButtonBase {...base} className={styles.root({ class: cn(classNames?.root, className) })}>
      <ChipContent
        styles={styles}
        classNames={classNames}
        leading={leadingIconOf(styles, leadingIcon, classNames?.leading)}
      >
        {children}
      </ChipContent>
    </ButtonBase>
  );
}

/* ------------------------------------------------------------------ Filter */

interface FilterChipOwnProps extends ChipCommonProps {
  /** Icon after the label, e.g. a dropdown arrow. Hidden from assistive tech. */
  trailingIcon?: ReactElement;
  elevated?: boolean;
}

export type FilterChipProps = FilterChipOwnProps &
  Omit<ButtonBaseToggleProps, keyof FilterChipOwnProps | 'toggle'>;

/**
 * M3 filter chip: a toggle (`aria-pressed`) for filtering content. Its corners morph from
 * 12px to round when selected; without a `leadingIcon` a check grows in. Controlled with
 * `selected` / `onSelectedChange` or uncontrolled with `defaultSelected`.
 *
 * @example
 * <FilterChip selected={vegan} onSelectedChange={setVegan}>Vegan</FilterChip>
 */
export function FilterChip({
  children,
  leadingIcon,
  trailingIcon,
  elevated,
  classNames,
  className,
  ...base
}: FilterChipProps) {
  const styles = chipStyles({
    kind: 'filter',
    elevated,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: Boolean(trailingIcon),
  });
  const check = (
    <span aria-hidden="true" className={styles.check()}>
      <span className={styles.checkInner()}>
        <span className={styles.checkIcon({ class: classNames?.leading })}>
          <CheckIcon />
        </span>
      </span>
    </span>
  );
  return (
    <ButtonBase
      {...base}
      toggle
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ChipContent
        styles={styles}
        classNames={classNames}
        leading={leadingIcon ? leadingIconOf(styles, leadingIcon, classNames?.leading) : check}
        trailing={
          trailingIcon && (
            <span aria-hidden="true" className={styles.trailing({ class: classNames?.trailing })}>
              {trailingIcon}
            </span>
          )
        }
      >
        {children}
      </ChipContent>
    </ButtonBase>
  );
}

/* ------------------------------------------------------------------- Input */

export interface InputChipClassNames extends ChipClassNames {
  primary?: string;
  avatar?: string;
  remove?: string;
}

interface InputChipOwnProps {
  /** The label. */
  children: ReactNode;
  /** Icon before the label (18px). Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  /** A 24px round image before the label (takes precedence over `leadingIcon`). */
  avatar?: ReactElement;
  /** Shows the chip as selected (`aria-pressed`). */
  selected?: boolean;
  /** The chip's action, e.g. editing the entry. */
  onPress?: ButtonBaseActionProps['onPress'];
  /** Shows a remove button; also called on Backspace or Delete. */
  onRemove?: () => void;
  /** First word of the remove button's name, which ends with the label. @default "Remove" */
  removeLabel?: string;
  disabled?: boolean;
  classNames?: InputChipClassNames;
  className?: string;
  style?: React.CSSProperties;
}

export type InputChipProps = InputChipOwnProps &
  Omit<React.ComponentPropsWithRef<'div'>, keyof InputChipOwnProps>;

/**
 * M3 input chip: a discrete piece of information the user entered, such as a recipient.
 * The chip's action and its optional remove button are separate buttons; Backspace or
 * Delete on the chip also removes it. Corners morph to round when `selected`.
 *
 * @example
 * <InputChip avatar={<img src={alice.photo} alt="" />} onRemove={() => remove(alice)}>
 *   Alice
 * </InputChip>
 */
export function InputChip({
  children,
  leadingIcon,
  avatar,
  selected,
  onPress,
  onRemove,
  removeLabel = 'Remove',
  disabled,
  classNames,
  className,
  ...rest
}: InputChipProps) {
  const labelId = useId();
  const removeId = useId();
  const styles = chipStyles({
    kind: 'input',
    leading: avatar ? 'avatar' : leadingIcon ? 'icon' : 'none',
    trailing: Boolean(onRemove),
  });
  const leading = avatar ? (
    <span aria-hidden="true" className={styles.leading({ class: classNames?.leading })}>
      <span className={styles.avatar({ class: classNames?.avatar })}>{avatar}</span>
    </span>
  ) : (
    leadingIconOf(styles, leadingIcon, classNames?.leading)
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (onRemove && !disabled && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onRemove();
    }
  };

  return (
    <div
      {...rest}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ButtonBase
        disabled={disabled}
        onPress={onPress}
        onKeyDown={onKeyDown}
        aria-pressed={selected}
        data-chip-primary=""
        className={styles.primary({ class: classNames?.primary })}
      >
        <span className={styles.content({ class: classNames?.content })}>
          <TouchTarget />
          {leading}
          <span id={labelId} className={styles.label({ class: classNames?.label })}>
            {children}
          </span>
        </span>
      </ButtonBase>
      {onRemove && (
        <ButtonBase
          disabled={disabled}
          onPress={onRemove}
          aria-labelledby={`${removeId} ${labelId}`}
          className={styles.remove({ class: classNames?.remove })}
        >
          <span id={removeId} hidden>
            {removeLabel}
          </span>
          <CloseIcon />
        </ButtonBase>
      )}
    </div>
  );
}
