'use client';

import {
  useContext,
  useId,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { VisuallyHidden } from 'react-aria';
import { useToggleState } from 'react-stately';
import {
  ButtonBase,
  ToggleGroupStateContext,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { TouchTarget } from '../../primitives/TouchTarget';
import { densityAttribute, type Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { chipStyles, type ChipOutline } from './chip-styles';

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
    <svg aria-hidden="true" viewBox="0 -960 960 960" fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export interface ChipClassNames {
  /** The chip's container, merged with `className`. */
  root?: string;
  /** The row holding the leading icon, label and trailing icon. */
  content?: string;
  /** The leading icon or avatar slot. */
  leading?: string;
  /** The label text. */
  label?: string;
  /** The trailing icon slot. */
  trailing?: string;
}

export interface ChipLabels {
  /** First word of the remove button's name, which ends with the label. @default "Remove" */
  remove: string;
  /**
   * Announces a selected `InputChip` that has no `onPress` (with one, its action carries
   * `aria-pressed`): the remove button's description, or hidden text on a static chip.
   * @default "Selected"
   */
  selected: string;
}

const DEFAULT_LABELS: ChipLabels = { remove: 'Remove', selected: 'Selected' };

interface ChipCommonProps {
  /** The label. */
  children: ReactNode;
  /** Icon before the label (18px). Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  /**
   * The flat chip's border: `outline-variant`, or `strong` (`outline`) for 3:1 contrast
   * where nothing else shows the chip is interactive. @default "standard"
   */
  outline?: ChipOutline;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the chip's height (32px at 0, 24px at -2
   * and -3); its touch target stays 48px. Left out, the chip takes the density of the nearest
   * `ChipSet`, `ThemeProvider` or `ThemeScope`. M3 asks for density to be the reader's choice
   * rather than a default, so prefer setting it there, from a setting.
   * @default 0
   */
  density?: Density;
  /** Classes for each part, by slot. */
  classNames?: ChipClassNames;
}

type Styles = ReturnType<typeof chipStyles>;

function ChipContent({
  styles,
  classNames,
  leading,
  children,
  trailing,
  labelId,
}: {
  styles: Styles;
  classNames?: ChipClassNames;
  leading?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  labelId?: string;
}) {
  return (
    <span className={styles.content({ class: classNames?.content })}>
      <TouchTarget />
      {leading}
      <span id={labelId} className={styles.label({ class: classNames?.label })}>
        {children}
      </span>
      {trailing}
    </span>
  );
}

/**
 * The component tokens' hooks (chip-tokens.ts): each kind's set, followed by any set the app
 * passed on the same element (`props`), and whether the chip is elevated, which picks its
 * elevated container token; and the chip's own density, if set.
 */
const tokenAttributes = (
  kind: 'assist' | 'suggestion' | 'filter' | 'input',
  elevated: boolean | undefined,
  density: Density | undefined,
  props?: object,
) => ({
  'data-tokens': mergeDataTokens(`md-comp-${kind}-chip`, props),
  'data-elevated': elevated || undefined,
  ...densityAttribute(density),
});

const leadingIconOf = (styles: Styles, icon: ReactElement | undefined, className?: string) =>
  icon && (
    <span aria-hidden="true" data-slot="leading" className={styles.leading({ class: className })}>
      {icon}
    </span>
  );

const trailingIconOf = (styles: Styles, icon: ReactElement | undefined, className?: string) =>
  icon && (
    <span aria-hidden="true" className={styles.trailing({ class: className })}>
      {icon}
    </span>
  );

/** Backspace or Delete on a removable chip removes it (M3 chips, keyboard navigation). */
const removeKeys =
  (onRemove: (() => void) | undefined, disabled: boolean | undefined) =>
  (event: KeyboardEvent<HTMLElement>) => {
    if (onRemove && !disabled && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onRemove();
    }
  };

/** The remove button: named "Remove" + the chip's label, with a 48px target. */
function RemoveButton({
  styles,
  className,
  labelId,
  labels,
  onRemove,
  disabled,
  describedBy,
}: {
  styles: Styles;
  className?: string;
  labelId: string;
  labels?: Partial<ChipLabels>;
  onRemove: () => void;
  disabled?: boolean;
  /** An element describing the chip's state (a selected input chip without an action). */
  describedBy?: string;
}) {
  const removeId = useId();
  const { remove } = { ...DEFAULT_LABELS, ...labels };
  return (
    <ButtonBase
      disabled={disabled}
      onPress={onRemove}
      onKeyDown={removeKeys(onRemove, disabled)}
      aria-labelledby={`${removeId} ${labelId}`}
      aria-describedby={describedBy}
      data-chip-remove=""
      className={styles.remove({ class: className })}
    >
      <TouchTarget />
      <span id={removeId} hidden>
        {remove}
      </span>
      <CloseIcon />
    </ButtonBase>
  );
}

/* ------------------------------------------------------------------ Assist */

interface AssistChipOwnProps extends ChipCommonProps {
  /** `surface-container-low` at level 1 instead of an outline. @default false */
  elevated?: boolean;
}

type OmitChip<T> = Omit<T, keyof AssistChipOwnProps | 'toggle'>;

export type AssistChipProps = AssistChipOwnProps &
  (OmitChip<ButtonBaseActionProps> | OmitChip<ButtonBaseLinkProps>);

/**
 * M3 assist chip: a smart or automated action that can span apps, such as opening a calendar
 * event. A button, or a link with `href`. Assist chips have no trailing icon.
 *
 * @example
 * <AssistChip leadingIcon={<EventIcon />} onPress={addToCalendar}>Add to calendar</AssistChip>
 */
export function AssistChip({
  children,
  leadingIcon,
  elevated,
  outline,
  density,
  classNames,
  className,
  ...base
}: AssistChipProps) {
  const styles = chipStyles({
    kind: 'assist',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
  });
  return (
    <ButtonBase
      {...(base as ButtonBaseActionProps)}
      {...tokenAttributes('assist', elevated, density, base)}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
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

/* -------------------------------------------------------------- Suggestion */

interface SuggestionChipOwnProps extends ChipCommonProps {
  /** `surface-container-low` at level 1 instead of an outline. @default false */
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
  outline,
  density,
  classNames,
  className,
  ...base
}: SuggestionChipProps) {
  const styles = chipStyles({
    kind: 'suggestion',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
  });
  return (
    <ButtonBase
      {...base}
      {...tokenAttributes('suggestion', elevated, density, base)}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
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

export interface FilterChipClassNames extends ChipClassNames {
  /** The toggle of a chip with a remove button. */
  primary?: string;
  /** The remove button after the label. */
  remove?: string;
}

interface FilterChipOwnProps extends Omit<ChipCommonProps, 'classNames'> {
  /**
   * Icon after the label, e.g. a dropdown arrow when the chip opens a menu. Hidden from
   * assistive tech; the whole chip is the control. Not with `onRemove`.
   */
  trailingIcon?: ReactElement;
  /**
   * Adds a remove button after the label, a second focus stop named "Remove" + the label
   * (M3: for medium and expanded windows). Backspace or Delete on the chip also calls it.
   */
  onRemove?: () => void;
  /** Words the chip announces, with English defaults. */
  labels?: Partial<ChipLabels>;
  /** `surface-container-low` at level 1 instead of an outline. @default false */
  elevated?: boolean;
  /** Classes for each part, by slot. */
  classNames?: FilterChipClassNames;
}

export type FilterChipProps = FilterChipOwnProps &
  Omit<ButtonBaseToggleProps, keyof FilterChipOwnProps | 'toggle'>;

/**
 * M3 filter chip: a toggle (`aria-pressed`, or a radio in a single-select `ChipSet`) for
 * filtering content. Without a `leadingIcon` a check grows in when selected. Controlled
 * with `selected` / `onSelectedChange`, uncontrolled with `defaultSelected`, or through a
 * `ChipSet`'s selection with a `value`.
 *
 * @example
 * <FilterChip selected={vegan} onSelectedChange={setVegan}>Vegan</FilterChip>
 */
export function FilterChip(props: FilterChipProps) {
  const { onRemove } = props;
  return onRemove ? (
    <RemovableFilterChip {...props} onRemove={onRemove} />
  ) : (
    <SimpleFilterChip {...props} />
  );
}

function filterLeading(styles: Styles, leadingIcon: ReactElement | undefined, className?: string) {
  if (leadingIcon) return leadingIconOf(styles, leadingIcon, className);
  return (
    <span aria-hidden="true" className={styles.check()}>
      <span className={styles.checkInner()}>
        <span className={styles.checkIcon({ class: className })}>
          <CheckIcon />
        </span>
      </span>
    </span>
  );
}

function SimpleFilterChip({
  children,
  leadingIcon,
  trailingIcon,
  elevated,
  outline,
  density,
  classNames,
  className,
  onRemove: _onRemove,
  labels: _labels,
  ...base
}: FilterChipProps) {
  const styles = chipStyles({
    kind: 'filter',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: Boolean(trailingIcon),
  });
  return (
    <ButtonBase
      {...base}
      {...tokenAttributes('filter', elevated, density, base)}
      toggle
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ChipContent
        styles={styles}
        classNames={classNames}
        leading={filterLeading(styles, leadingIcon, classNames?.leading)}
        trailing={trailingIconOf(styles, trailingIcon, classNames?.trailing)}
      >
        {children}
      </ChipContent>
    </ButtonBase>
  );
}

/** A filter chip with a remove button: a container of the toggle and the remove button. */
function RemovableFilterChip({
  children,
  leadingIcon,
  trailingIcon: _trailingIcon,
  elevated,
  outline,
  density,
  classNames,
  className,
  style,
  onRemove,
  labels,
  selected,
  defaultSelected,
  onSelectedChange,
  value,
  disabled,
  onKeyDown,
  ...base
}: FilterChipProps & { onRemove: () => void }) {
  const labelId = useId();
  const groupState = useContext(ToggleGroupStateContext);
  const inGroup = groupState != null && value !== undefined;
  const ownState = useToggleState({
    isSelected: selected,
    defaultSelected,
    onChange: onSelectedChange,
  });
  const isSelected = inGroup ? groupState.selectedKeys.has(value) : ownState.isSelected;
  const isDisabled = Boolean(disabled || (inGroup && groupState.isDisabled));
  const styles = chipStyles({
    kind: 'filter',
    split: 'two',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: true,
  });
  const toggleProps = inGroup
    ? { value }
    : { value, selected: ownState.isSelected, onSelectedChange: ownState.setSelected };
  return (
    <div
      {...tokenAttributes('filter', elevated, density)}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ButtonBase
        {...base}
        {...toggleProps}
        toggle
        disabled={disabled}
        onKeyDown={(event) => {
          removeKeys(onRemove, isDisabled)(event);
          onKeyDown?.(event);
        }}
        data-chip-primary=""
        className={styles.primary({ class: classNames?.primary })}
      >
        <ChipContent
          styles={styles}
          classNames={classNames}
          labelId={labelId}
          leading={filterLeading(styles, leadingIcon, classNames?.leading)}
        >
          {children}
        </ChipContent>
      </ButtonBase>
      <RemoveButton
        styles={styles}
        className={classNames?.remove}
        labelId={labelId}
        labels={labels}
        onRemove={onRemove}
        disabled={isDisabled}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- Input */

export interface InputChipClassNames extends ChipClassNames {
  /** The chip's action (a button with `onPress`), or its label part. */
  primary?: string;
  /** The avatar image before the label. */
  avatar?: string;
  /** The remove button after the label. */
  remove?: string;
}

interface InputChipOwnProps {
  /** The label. */
  children: ReactNode;
  /** Icon before the label (18px). Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  /** A 24px image before the label, with 12px corners (takes precedence over `leadingIcon`). */
  avatar?: ReactElement;
  /** Shows the chip as selected (`aria-pressed` on its action). */
  selected?: boolean;
  /** The chip's action, e.g. editing the entry. Makes the chip's label part a button. */
  onPress?: ButtonBaseActionProps['onPress'];
  /** Shows a remove button; also called on Backspace or Delete. */
  onRemove?: () => void;
  /** Words the chip announces, with English defaults. */
  labels?: Partial<ChipLabels>;
  /** The flat chip's border. @default "standard" */
  outline?: ChipOutline;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the chip's height (32px at 0, 24px at -2
   * and -3); its touch target stays 48px. Left out, the chip takes the density of the nearest
   * `ChipSet`, `ThemeProvider` or `ThemeScope`. M3 asks for density to be the reader's choice
   * rather than a default, so prefer setting it there, from a setting.
   * @default 0
   */
  density?: Density;
  /** Disables the chip's action and its remove button. @default false */
  disabled?: boolean;
  /** Classes for each part, by slot. */
  classNames?: InputChipClassNames;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
}

export type InputChipProps = InputChipOwnProps &
  Omit<React.ComponentPropsWithRef<'div'>, keyof InputChipOwnProps>;

/**
 * M3 input chip: a discrete piece of information the user entered, such as a recipient.
 * M3 expects input chips to be removable: give it `onRemove` unless the entry is fixed.
 *
 * With `onPress` and `onRemove`, the chip's action and its remove button are two focus
 * stops. With only `onRemove`, the chip is one focus stop (the remove button, named
 * "Remove" + the label), as M3 asks. Backspace or Delete on the chip removes it. A chip
 * with a remove button is at least 88px wide, so the button's 48px target never covers
 * the label.
 *
 * @example
 * <InputChip avatar={<img src={photo} alt="" />} onRemove={() => remove(id)}>
 *   Alex
 * </InputChip>
 */
export function InputChip({
  children,
  leadingIcon,
  avatar,
  selected,
  onPress,
  onRemove,
  labels,
  outline,
  density,
  disabled,
  classNames,
  className,
  ...rest
}: InputChipProps) {
  const labelId = useId();
  const selectedId = useId();
  const split = onRemove ? (onPress ? 'two' : 'removeOnly') : 'none';
  // Without an action there's no `aria-pressed` to carry the selection, so it's said in words
  // (WCAG 1.3.1): the remove button's description, or hidden text on a static chip.
  const announceSelected = Boolean(selected) && !onPress;
  const selectedWord = { ...DEFAULT_LABELS, ...labels }.selected;
  const styles = chipStyles({
    kind: 'input',
    split,
    outline,
    leading: avatar ? 'avatar' : leadingIcon ? 'icon' : 'none',
    trailing: Boolean(onRemove),
  });
  const leading = avatar ? (
    <span
      aria-hidden="true"
      data-slot="leading"
      className={styles.leading({ class: classNames?.leading })}
    >
      <span className={styles.avatar({ class: classNames?.avatar })}>{avatar}</span>
    </span>
  ) : (
    leadingIconOf(styles, leadingIcon, classNames?.leading)
  );
  const content = (
    <ChipContent styles={styles} classNames={classNames} leading={leading} labelId={labelId}>
      {children}
    </ChipContent>
  );

  return (
    <div
      {...rest}
      {...tokenAttributes('input', undefined, density, rest)}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {onPress ? (
        <ButtonBase
          disabled={disabled}
          onPress={onPress}
          onKeyDown={removeKeys(onRemove, disabled)}
          aria-pressed={selected}
          data-chip-primary=""
          className={styles.primary({ class: classNames?.primary })}
        >
          {content}
        </ButtonBase>
      ) : (
        <span data-chip-primary="" className={styles.primary({ class: classNames?.primary })}>
          {content}
          {announceSelected &&
            (onRemove ? (
              <span id={selectedId} hidden>
                {selectedWord}
              </span>
            ) : (
              <VisuallyHidden>{`, ${selectedWord}`}</VisuallyHidden>
            ))}
        </span>
      )}
      {onRemove && (
        <RemoveButton
          styles={styles}
          className={classNames?.remove}
          labelId={labelId}
          labels={labels}
          onRemove={onRemove}
          disabled={disabled}
          describedBy={announceSelected ? selectedId : undefined}
        />
      )}
    </div>
  );
}
