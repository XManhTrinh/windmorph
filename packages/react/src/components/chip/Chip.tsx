'use client';

import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { useObjectRef, VisuallyHidden } from 'react-aria';
import { useToggleState } from 'react-stately';
import { useLabels } from '../labels/use-labels';
import {
  ButtonBase,
  ToggleGroupStateContext,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { ChipSetDisabledContext } from '../../primitives/ChipSetContext';
import { TouchTarget } from '../../primitives/TouchTarget';
import { TriggerContext } from '../../primitives/TriggerContext';
import { densityAttribute, type Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { isDraggedAttribute } from '../../utils/dragged-attribute';
import { splitRootProps } from '../../utils/root-props';
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

/**
 * The remove button: named "Remove" + the chip's label, with a touch target of its own, 48px
 * wide, or 41px beside a toggle or an action, where it stops at the label.
 */
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
  const { remove } = useLabels('Chip', DEFAULT_LABELS, labels);
  return (
    // An overlay trigger around the chip (a menu, a tooltip) is for its main button. Without
    // this the remove button took the trigger's props too: its id, `aria-haspopup` and
    // `aria-expanded`, and its press, so Remove also opened the overlay (2026-11-13).
    <TriggerContext value={null}>
      <ButtonBase
        disabled={disabled}
        onPress={onRemove}
        onKeyDown={removeKeys(onRemove, disabled)}
        aria-labelledby={`${removeId} ${labelId}`}
        aria-describedby={describedBy}
        data-chip-remove=""
        className={styles.remove({ class: className })}
      >
        <TouchTarget className={styles.removeTarget()} />
        <span id={removeId} hidden>
          {remove}
        </span>
        <CloseIcon />
      </ButtonBase>
    </TriggerContext>
  );
}

/** A chip is disabled by its own `disabled`, or by a disabled `ChipSet` around it. */
function useChipDisabled(disabled: boolean | undefined): boolean {
  const setDisabled = useContext(ChipSetDisabledContext);
  return Boolean(disabled) || setDisabled;
}

/**
 * The attributes about a whole chip rather than its button: `data-*` (styling and test hooks,
 * which belong with `className`), what hides the chip or sets its language and direction, and
 * `draggable` with the drag events, so the chip is picked up whole, remove button included,
 * and its handlers hear the drag that starts on it.
 */
const WHOLE_CHIP =
  /^(?:data-.+|hidden|inert|dir|lang|translate|aria-hidden|draggable|onDr(?:ag\w*|op)(?:Capture)?)$/;

/**
 * A removable filter chip's props for its container, apart from the ones for its toggle
 * (2026-11-13). The toggle stays the chip's button, as in a chip without a remove button:
 * `ref`, `id`, the handlers and every attribute of a button, ARIA included, stay on it. The
 * container takes `className` and `style`, and with them the attributes about the whole chip
 * ({@link WHOLE_CHIP}). Those went to the toggle too, where a `data-*` attribute never met the
 * class written for it, an app's `data-tokens` was not added to the chip's own, and `hidden` or
 * `aria-hidden` left the remove button behind.
 */
function splitWholeChip(props: object) {
  const whole: Record<string, unknown> = {};
  const button: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    (WHOLE_CHIP.test(key) ? whole : button)[key] = value;
  }
  return { whole, button };
}

/**
 * An input chip's props for its container, apart from the `aria-*` attributes that name or
 * describe a control (the naming, widget and description ones, which `splitRootProps` keeps
 * off a wrapping root), for its action's button.
 */
function splitControlAria(props: object) {
  const { root, rest } = splitRootProps(props, { wrapper: true });
  const container: Record<string, unknown> = { ...root };
  const control: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    (key.startsWith('aria-') ? control : container)[key] = value;
  }
  return { container, control };
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
  const disabled = useChipDisabled(base.disabled);
  return (
    <ButtonBase
      {...(base as ButtonBaseActionProps)}
      {...tokenAttributes('assist', elevated, density, base)}
      disabled={disabled}
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
  const disabled = useChipDisabled(base.disabled);
  return (
    <ButtonBase
      {...base}
      {...tokenAttributes('suggestion', elevated, density, base)}
      disabled={disabled}
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
  /**
   * Words the chip announces, with English defaults. A {@link LabelsProvider} sets them for the
   * whole app.
   */
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
 * With `onRemove` the chip is a container holding the toggle and the remove button. The toggle
 * is still the chip's button: `ref`, `id`, the press, focus and key handlers and every
 * attribute of a button, ARIA included, go to it, as without `onRemove`. `className` and
 * `style` go on the container, and with them what is about the whole chip: `data-*`, `hidden`,
 * `inert`, `dir`, `lang`, `translate`, `aria-hidden`, and `draggable` with the drag handlers.
 *
 * @example
 * <FilterChip selected={vegan} onSelectedChange={setVegan}>Vegan</FilterChip>
 */
export function FilterChip(props: FilterChipProps) {
  const { onRemove, selected, defaultSelected, onSelectedChange, value, ref } = props;
  const inGroup = useContext(ToggleGroupStateContext) != null && value !== undefined;
  // The chip's own selection lives here, above its two forms. With `onRemove` the chip is a
  // container of two buttons and without it one button, so React builds the toggle anew when
  // an app adds or drops `onRemove` (a remove button shown from a breakpoint up). Kept in the
  // form, an uncontrolled selection went with the old toggle, and so did keyboard focus.
  const own = useToggleState({ isSelected: selected, defaultSelected, onChange: onSelectedChange });
  const toggleRef = useObjectRef(ref);
  const focusWasInside = useRef(false);
  const removable = Boolean(onRemove);
  const wasRemovable = useRef(removable);
  useLayoutEffect(() => {
    // Only as one form takes the other's place. A form also notes focus when its effects
    // are torn down for another reason (hidden by an `Activity`, Strict Mode's second run),
    // and that note must never move focus later, from wherever the person has gone since.
    const swapped = wasRemovable.current !== removable;
    wasRemovable.current = removable;
    const refocus = swapped && focusWasInside.current;
    focusWasInside.current = false;
    if (refocus) toggleRef.current?.focus({ preventScroll: true });
  }, [removable, toggleRef]);
  // In a selection group the group holds the selection, and `ButtonBase` warns about these.
  const selection = inGroup
    ? {}
    : { selected: own.isSelected, defaultSelected: undefined, onSelectedChange: own.setSelected };
  return onRemove ? (
    <RemovableFilterChip
      {...props}
      {...selection}
      ref={toggleRef}
      onRemove={onRemove}
      focusWasInside={focusWasInside}
    />
  ) : (
    <SimpleFilterChip {...props} {...selection} ref={toggleRef} focusWasInside={focusWasInside} />
  );
}

/** What `FilterChip` gives each of its forms beside the chip's props. */
interface FilterChipFormProps {
  ref: RefObject<HTMLButtonElement | null>;
  /** Set by a form as it goes, when focus was in it, for the form that takes its place. */
  focusWasInside: RefObject<boolean>;
}

/**
 * As a form of the chip goes (its cleanup runs before React removes its elements), notes
 * whether keyboard focus was in it: on the toggle, or on the remove button beside it.
 */
function useNoteFocusInside(
  { ref, focusWasInside }: FilterChipFormProps,
  chipOf: (toggle: HTMLElement) => Element | null,
) {
  useLayoutEffect(
    () => () => {
      const toggle = ref.current;
      const chip = toggle && chipOf(toggle);
      focusWasInside.current = Boolean(chip?.contains(chip.ownerDocument.activeElement));
    },
    // Only as the form unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
  focusWasInside,
  ...base
}: Omit<FilterChipProps, 'ref'> & FilterChipFormProps) {
  useNoteFocusInside({ ref: base.ref, focusWasInside }, (toggle) => toggle);
  const styles = chipStyles({
    kind: 'filter',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: Boolean(trailingIcon),
  });
  const disabled = useChipDisabled(base.disabled);
  return (
    <ButtonBase
      {...base}
      {...tokenAttributes('filter', elevated, density, base)}
      disabled={disabled}
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
  value,
  disabled: disabledProp,
  dragged,
  onKeyDown,
  focusWasInside,
  ...base
}: Omit<FilterChipProps, 'ref'> & FilterChipFormProps & { onRemove: () => void }) {
  useNoteFocusInside({ ref: base.ref, focusWasInside }, (toggle) => toggle.parentElement);
  const disabled = useChipDisabled(disabledProp);
  const labelId = useId();
  const groupState = useContext(ToggleGroupStateContext);
  const inGroup = groupState != null && value !== undefined;
  const isSelected = inGroup ? groupState.selectedKeys.has(value) : Boolean(selected);
  const isDisabled = Boolean(disabled || (inGroup && groupState.isDisabled));
  const styles = chipStyles({
    kind: 'filter',
    split: 'two',
    elevated,
    outline,
    leading: leadingIcon ? 'icon' : 'none',
    trailing: true,
  });
  const { whole, button } = splitWholeChip(base);
  // Dragged by the prop or by the app's own attribute, on the container (whose classes read
  // it) and the toggle alike.
  const isDragged = dragged ?? isDraggedAttribute(whole['data-dragged']);
  return (
    <div
      {...whole}
      {...tokenAttributes('filter', elevated, density, whole)}
      data-dragged={isDragged || undefined}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ButtonBase
        {...button}
        value={value}
        selected={selected}
        toggle
        dragged={isDragged}
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
  /**
   * Words the chip announces, with English defaults. A {@link LabelsProvider} sets them for the
   * whole app.
   */
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
 * with a remove button is at least 88px wide (M3). The button's target is 48px, or 41px wide
 * beside an action: it stops where the label ends, so a press on the label is the action's.
 *
 * The container is the chip's root and takes its props. With `onPress`, the `aria-*` attributes
 * that name or describe a control (`aria-label`, `aria-describedby`, `aria-expanded`,
 * `aria-controls` …) go to the action's button instead, unless the container has a `role` of
 * its own for them to name.
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
  disabled: disabledProp,
  classNames,
  className,
  ...rest
}: InputChipProps) {
  const disabled = useChipDisabled(disabledProp);
  const labelId = useId();
  const selectedId = useId();
  const split = onRemove ? (onPress ? 'two' : 'removeOnly') : onPress ? 'action' : 'none';
  // Without an action there's no `aria-pressed` to carry the selection, so it's said in words
  // (WCAG 1.3.1): the remove button's description, or hidden text on a static chip.
  const announceSelected = Boolean(selected) && !onPress;
  const selectedWord = useLabels('Chip', DEFAULT_LABELS, labels).selected;
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
  // With an action, the attributes that name or describe a control are its button's: on the
  // container, which has no role, they named and described nothing (2026-11-13). A container
  // the app gives a `role` keeps them, since they name and describe that role.
  const { container, control } =
    onPress && rest.role === undefined ? splitControlAria(rest) : { container: rest, control: {} };

  return (
    <div
      {...container}
      {...tokenAttributes('input', undefined, density, rest)}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {onPress ? (
        <ButtonBase
          {...control}
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
