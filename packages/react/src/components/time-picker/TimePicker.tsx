'use client';

import { Time } from '@internationalized/date';
import { animate, useReducedMotion, type AnimationPlaybackControls } from 'motion/react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useFocusRing,
  useFocusVisible,
  useHover,
  useLocale,
  useNumberFormatter,
} from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import { useM3Spring } from '../../motion/use-m3-spring';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { KeyboardIcon, ScheduleIcon } from '../date-picker/picker-icons';
import { useMediaQuery } from '../date-picker/use-media-query';
import { IconButton } from '../icon-button/IconButton';
import { timePickerStyles } from './time-picker-styles';

/** Compose's clock geometry (TimePicker.kt), in px on the 256px dial. */
const DIAL = 256;
const CENTER = DIAL / 2;
const OUTER_RADIUS = 101;
const INNER_RADIUS = 69;
const HANDLE = 48;
/** A press nearer the centre than this picks the inner 24-hour ring (Compose's `MaxDistance`). */
const INNER_RING_MAX_DISTANCE = 74;
/** Each number on the dial is a 48px target (M3: "Targets for dial selectors should be 48x48dp"). */
const TARGET = 48;

export interface TimePickerStrings {
  /** Name of the hour selector and field. @default "Hour" */
  hour?: string;
  /** Name of the minute selector and field. @default "Minute" */
  minute?: string;
  /** The AM option. @default "AM" */
  am?: string;
  /** The PM option. @default "PM" */
  pm?: string;
  /** Name of the AM / PM selector. @default "AM or PM" */
  period?: string;
  /** Name of the dial. @default "Clock" */
  dial?: string;
  /** {@link TimePickerModeToggle}'s name in dial mode. @default "Toggle input picker" */
  inputMode?: string;
  /** {@link TimePickerModeToggle}'s name in input mode. @default "Toggle dial picker" */
  dialMode?: string;
  /**
   * Name of a number on the dial (M3: "{Value} Hours or minutes of {Total}"), e.g.
   * "7 hours of 12" or "35 minutes of 60".
   * @default `${value} ${unit} of ${total}`
   */
  dialValue?: (value: string, total: number, unit: 'hours' | 'minutes') => string;
}

export interface TimePickerClassNames {
  /** The picker's root; `className` is merged here too. */
  root?: string;
  /** The clock dial. */
  dial?: string;
}

export type TimePickerMode = 'dial' | 'input';

export interface TimePickerProps {
  /** Controlled time (`@internationalized/date` `Time`). */
  value?: Time;
  /** Initial time when uncontrolled. @default 12:00 */
  defaultValue?: Time;
  /** Called with the new time when the user changes it. */
  onChange?: (value: Time) => void;
  /** 12- or 24-hour clock. @default the locale's */
  hourCycle?: 12 | 24;
  /** The clock dial, or typed hour and minute fields (controlled). */
  mode?: TimePickerMode;
  /** Initial mode when uncontrolled. @default "dial" */
  defaultMode?: TimePickerMode;
  /** Called when the user switches between the dial and the typed input. */
  onModeChange?: (mode: TimePickerMode) => void;
  /**
   * `vertical` stacks the time over the dial; `horizontal` (landscape) puts them side by
   * side. `auto` picks vertical when the window is tall enough, horizontal when it is only
   * wide enough, and the typed input when neither fits, so the picker never scrolls (M3
   * time picker placement and adaptive design). @default "auto"
   */
  layout?: 'vertical' | 'horizontal' | 'auto';
  /** Words the picker shows and announces, with English defaults. */
  strings?: TimePickerStrings;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: TimePickerClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

/*
 * Window sizes for `layout="auto"`, from the picker in a `PickerDialog` (24px around the
 * panel, 24px padding, the title and the actions): the vertical dial needs 568px of
 * height; the horizontal one 452px of height and 640px of width.
 */
const SHORT_WINDOW = '(max-height: 567.98px)';
const NO_ROOM_FOR_DIAL = '(max-height: 451.98px), (max-height: 567.98px) and (max-width: 639.98px)';

/** Where an `auto` time picker's dial fits: `vertical`, `horizontal` or `none`. */
export function useTimePickerRoom(): 'vertical' | 'horizontal' | 'none' {
  const short = useMediaQuery(SHORT_WINDOW);
  const noRoom = useMediaQuery(NO_ROOM_FOR_DIAL);
  return noRoom ? 'none' : short ? 'horizontal' : 'vertical';
}

function localeHourCycle(locale: string): 12 | 24 {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
}

const defaultDialValue = (value: string, total: number, unit: 'hours' | 'minutes') =>
  `${value} ${unit} of ${total}`;

/**
 * M3 time picker (Compose's `TimePicker` and `TimeInput`): hour and minute selectors you
 * can type in, with an AM / PM selector, and a clock dial whose numbers are buttons (press,
 * drag, or Tab to one and press Enter; the hour moves on to the minutes); or typed fields
 * in input mode. It turns to a horizontal layout, or the input mode, when the window has
 * no room for the dial. Put it in a {@link PickerDialog} for the modal form, with a
 * {@link TimePickerModeToggle}.
 *
 * @example
 * <TimePicker value={time} onChange={setTime} />
 */
export function TimePicker({
  value,
  defaultValue,
  onChange,
  hourCycle: hourCycleProp,
  mode: modeProp,
  defaultMode = 'dial',
  onModeChange,
  layout = 'auto',
  strings = {},
  ref,
  className,
  style,
  classNames,
  ...rest
}: TimePickerProps) {
  const { data } = splitDataAttributes(rest);
  const { locale } = useLocale();
  const hourCycle = hourCycleProp ?? localeHourCycle(locale);
  const [time, setTime] = useControlledState(value, defaultValue ?? new Time(12, 0), onChange);
  const [chosenMode] = useControlledState(modeProp, defaultMode, onModeChange);
  const room = useTimePickerRoom();
  const fits = layout === 'auto' ? room : layout;
  const mode = fits === 'none' ? 'input' : chosenMode;
  const resolvedLayout = mode === 'input' || fits === 'none' ? 'vertical' : fits;
  const [selection, setSelection] = useState<'hour' | 'minute'>('hour');
  const styles = timePickerStyles({ hourCycle, mode, layout: resolvedLayout });
  const pad = useNumberFormatter({ minimumIntegerDigits: 2, useGrouping: false });
  const plain = useNumberFormatter({ useGrouping: false });
  const isPm = time.hour >= 12;
  const displayHour = hourCycle === 24 ? time.hour : time.hour % 12 || 12;
  const formatHour = (n: number) => (hourCycle === 24 ? pad.format(n) : plain.format(n));
  const setPeriod = (pm: boolean) => {
    if (pm !== isPm) setTime(time.set({ hour: (time.hour + 12) % 24 }));
  };
  const commitHour = (hour: number) =>
    setTime(time.set({ hour: hourCycle === 24 ? hour : (hour % 12) + (isPm ? 12 : 0) }));
  const hourLabel = strings.hour ?? 'Hour';
  const minuteLabel = strings.minute ?? 'Minute';
  const minuteRef = useRef<HTMLInputElement>(null);

  return (
    <div
      {...data}
      ref={ref}
      style={style}
      // The time picker's component tokens (time-picker-tokens.ts).
      data-tokens="md-comp-time-picker"
      data-mode={mode}
      data-layout={resolvedLayout}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {/* Time reads hour : minute, then AM / PM, in every direction (Compose forces LTR). */}
      <div dir="ltr" className={styles.display()}>
        <div className={styles.time()}>
          <NumberField
            label={hourLabel}
            value={displayHour}
            min={hourCycle === 24 ? 0 : 1}
            max={hourCycle === 24 ? 23 : 12}
            format={formatHour}
            onCommit={commitHour}
            // Input mode moves on to the minute once the hour is complete (Compose's TimeInput).
            onComplete={mode === 'input' ? () => minuteRef.current?.focus() : undefined}
            selector={mode === 'dial'}
            selected={selection === 'hour'}
            onFocus={() => setSelection('hour')}
            styles={styles}
          />
          <span aria-hidden="true" className={styles.separator()}>
            :
          </span>
          <NumberField
            label={minuteLabel}
            value={time.minute}
            min={0}
            max={59}
            format={(n) => pad.format(n)}
            onCommit={(minute) => setTime(time.set({ minute }))}
            inputRef={minuteRef}
            selector={mode === 'dial'}
            selected={selection === 'minute'}
            onFocus={() => setSelection('minute')}
            styles={styles}
          />
        </div>
        {hourCycle === 12 && (
          <PeriodGroup
            label={strings.period ?? 'AM or PM'}
            am={strings.am ?? 'AM'}
            pm={strings.pm ?? 'PM'}
            isPm={isPm}
            onChange={setPeriod}
            styles={styles}
          />
        )}
      </div>
      {mode === 'dial' && (
        <Dial
          time={time}
          setTime={setTime}
          selection={selection}
          onHourPicked={() => setSelection('minute')}
          hourCycle={hourCycle}
          label={strings.dial ?? 'Clock'}
          valueLabel={strings.dialValue ?? defaultDialValue}
          format={(n, minutes) => (minutes || hourCycle === 24 ? pad.format(n) : plain.format(n))}
          plain={(n) => plain.format(n)}
          styles={styles}
          className={classNames?.dial}
        />
      )}
    </div>
  );
}

export interface TimePickerModeToggleProps {
  /** The time picker's mode; the toggle switches to the other one. */
  mode: TimePickerMode;
  /** Called with the other mode when the toggle is pressed. */
  onModeChange: (mode: TimePickerMode) => void;
  /**
   * Words the toggle announces (`inputMode`, `dialMode`), with English defaults. Takes the
   * same object as the time picker's `strings`, so one set of words covers both.
   */
  strings?: TimePickerStrings;
  /** Shown in dial mode. Defaults to Material Symbols' keyboard. */
  keyboardIcon?: ReactElement;
  /** Shown in input mode. Defaults to Material Symbols' schedule (a clock). */
  clockIcon?: ReactElement;
  /** Classes for the icon button; consumer classes win. */
  className?: string;
}

/**
 * The time picker's keyboard / clock icon button (M3: "The input selector should be
 * accessible from the dial selector via the keyboard icon"), for `PickerDialog`'s
 * `modeToggleButton`. Hidden when the window has no room for the dial, where an `auto`
 * time picker shows only the input.
 *
 * @example
 * <PickerDialog variant="time" modeToggleButton={<TimePickerModeToggle mode={mode} onModeChange={setMode} />} …>
 *   <TimePicker mode={mode} onModeChange={setMode} />
 * </PickerDialog>
 */
export function TimePickerModeToggle({
  mode,
  onModeChange,
  strings = {},
  keyboardIcon,
  clockIcon,
  className,
}: TimePickerModeToggleProps) {
  const room = useTimePickerRoom();
  if (room === 'none') return null;
  return mode === 'dial' ? (
    <IconButton
      variant="standard"
      icon={keyboardIcon ?? <KeyboardIcon />}
      aria-label={strings.inputMode ?? 'Toggle input picker'}
      onPress={() => onModeChange('input')}
      className={className}
    />
  ) : (
    <IconButton
      variant="standard"
      icon={clockIcon ?? <ScheduleIcon />}
      aria-label={strings.dialMode ?? 'Toggle dial picker'}
      onPress={() => onModeChange('dial')}
      className={className}
    />
  );
}

/**
 * The AM / PM selector: a radio group (M3: "Radio button (in list)"), so it is one Tab stop
 * on the checked option and the arrow keys move the choice, as WAI-ARIA's radio group.
 */
function PeriodGroup({
  label,
  am,
  pm,
  isPm,
  onChange,
  styles,
}: {
  label: string;
  am: string;
  pm: string;
  isPm: boolean;
  onChange: (pm: boolean) => void;
  styles: ReturnType<typeof timePickerStyles>;
}) {
  const { direction } = useLocale();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const step =
      event.key === 'ArrowDown' || event.key === forward
        ? 1
        : event.key === 'ArrowUp' || event.key === backward
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    // Two options: either step moves to the other one, wrapping.
    const next = !isPm;
    onChange(next);
    refs.current[next ? 1 : 0]?.focus();
  };
  return (
    // The options keep the locale's direction for their order in the horizontal layout.
    <div
      role="radiogroup"
      aria-label={label}
      dir={direction}
      onKeyDown={onKeyDown}
      data-slot="period-selector"
      className={styles.period()}
    >
      {[false, true].map((option) => (
        <PeriodOption
          key={String(option)}
          ref={(element) => {
            refs.current[option ? 1 : 0] = element;
          }}
          label={option ? pm : am}
          selected={isPm === option}
          onSelect={() => onChange(option)}
          className={styles.periodOption()}
        />
      ))}
    </div>
  );
}

function PeriodOption({
  label,
  selected,
  onSelect,
  className,
  ref: refProp,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className: string;
  ref: (element: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { interactionProps, dataAttributes } = useM3Interaction({}, ref);
  return (
    <button
      {...mergeProps(interactionProps, { onClick: onSelect })}
      {...dataAttributes}
      ref={(element) => {
        ref.current = element;
        refProp(element);
      }}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      data-slot="period-selector-option"
      data-selected={selected || undefined}
      className={className}
    >
      {label}
    </button>
  );
}

/**
 * A typed hour or minute: the input mode's 96 × 72px field with its label below, or in
 * dial mode the 96 × 80px selector, which picks the dial's face when focused and takes
 * digits too (M3: "The dial time picker supports both manual and dial input").
 */
function NumberField({
  label,
  value,
  min,
  max,
  format,
  onCommit,
  onComplete,
  inputRef,
  selector,
  selected,
  onFocus,
  styles,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  format: (n: number) => string;
  onCommit: (value: number) => void;
  /** Called once a typed value can't take another digit (two digits, or "3" for an hour). */
  onComplete?: (() => void) | undefined;
  inputRef?: RefObject<HTMLInputElement | null>;
  selector: boolean;
  selected: boolean;
  onFocus: () => void;
  styles: ReturnType<typeof timePickerStyles>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const { focusProps, isFocusVisible } = useFocusRing();
  // A selector shows hover and pressed state layers (M3 states: Enabled, Hover, Focus, Pressed).
  const { hoverProps, isHovered } = useHover({ isDisabled: !selector });
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);
  const parsed = draft === null ? value : Number(draft);
  const invalid =
    draft !== null && (draft === '' || Number.isNaN(parsed) || parsed < min || parsed > max);
  const input = (
    <input
      {...mergeProps(focusProps, hoverProps, {
        onFocus: (event: { currentTarget: HTMLInputElement }) => {
          event.currentTarget.select();
          onFocus();
        },
      })}
      ref={inputRef}
      onPointerDown={() => selector && setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      inputMode="numeric"
      aria-label={label}
      aria-invalid={invalid || undefined}
      maxLength={2}
      value={draft ?? format(value)}
      data-slot={selector ? 'time-selector' : undefined}
      data-selected={(selector && selected) || undefined}
      data-focus-visible={(selector && isFocusVisible) || undefined}
      data-hovered={(selector && isHovered) || undefined}
      data-pressed={(selector && pressed) || undefined}
      onChange={(event) => {
        const text = event.target.value.replace(/\D/g, '');
        setDraft(text);
        const next = Number(text);
        if (text === '' || next < min || next > max) return;
        onCommit(next);
        if (text.length === 2 || next * 10 > max) onComplete?.();
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        const step = event.key === 'ArrowUp' ? 1 : -1;
        const next = value + step > max ? min : value + step < min ? max : value + step;
        setDraft(null);
        onCommit(next);
      }}
      className={selector ? styles.selector() : styles.field()}
    />
  );
  if (selector) return input;
  return (
    <label className={styles.fieldColumn()}>
      {input}
      <span aria-hidden="true" className={styles.fieldLabel()}>
        {label}
      </span>
    </label>
  );
}

/** Angle of a dial position (0 at 12 o'clock, clockwise), in turns. */
const turnOf = (x: number, y: number) =>
  (Math.atan2(x - CENTER, CENTER - y) / (2 * Math.PI) + 1) % 1;
const pointOf = (turn: number, radius: number) => ({
  x: CENTER + radius * Math.sin(turn * 2 * Math.PI),
  y: CENTER - radius * Math.cos(turn * 2 * Math.PI),
});

interface DialNumber {
  value: number;
  turn: number;
  radius: number;
}

/** The numbers on the face: minutes in fives, hours 12 / 1–11, plus 12–23 inside for 24 hours. */
function dialNumbers(minutes: boolean, hourCycle: 12 | 24): DialNumber[] {
  const ring = (radius: number, valueAt: (i: number) => number) =>
    Array.from({ length: 12 }, (_, i) => ({ value: valueAt(i), turn: i / 12, radius }));
  if (minutes) return ring(OUTER_RADIUS, (i) => i * 5);
  if (hourCycle === 12) return ring(OUTER_RADIUS, (i) => i || 12);
  // 24 hours: 00–11 on the outer ring, 12–23 on the inner one (as Compose and Android).
  return [...ring(OUTER_RADIUS, (i) => i), ...ring(INNER_RADIUS, (i) => i + 12)];
}

/** The shortest signed way round the dial from one turn to another, in turns (−½ to ½). */
const shortestTurn = (from: number, to: number) => ((((to - from) % 1) + 1.5) % 1) - 0.5;

/**
 * The hand's track, handle and the clip of the `on-primary` numbers follow the drawn angle,
 * set as attributes from an animation (no React render per frame). It turns to a new value
 * on the default spatial spring along the shortest arc (M3: "Spatial springs apply to …
 * rotation"; Compose animates the selector on hour ↔ minute and taps), follows a drag
 * directly, and jumps under reduced motion.
 */
function useDialHand(
  turn: number,
  radius: number,
  follow: RefObject<boolean>,
  parts: RefObject<{
    track: SVGLineElement | null;
    handle: SVGCircleElement | null;
    clip: SVGCircleElement | null;
  }>,
) {
  const spring = useM3Spring('spatial', 'default');
  const reducedMotion = useReducedMotion() ?? false;
  const drawn = useRef({ turn, radius });
  const animation = useRef<AnimationPlaybackControls | null>(null);

  // Before paint, so the hand never flashes at its new value before turning there.
  useLayoutEffect(() => {
    const draw = (nextTurn: number, nextRadius: number) => {
      drawn.current = { turn: nextTurn, radius: nextRadius };
      const point = pointOf(nextTurn, nextRadius);
      const { track, handle, clip } = parts.current;
      track?.setAttribute('x2', String(point.x));
      track?.setAttribute('y2', String(point.y));
      for (const circle of [handle, clip]) {
        circle?.setAttribute('cx', String(point.x));
        circle?.setAttribute('cy', String(point.y));
      }
    };
    const from = drawn.current;
    const delta = shortestTurn(from.turn, turn);
    animation.current?.stop();
    if (follow.current || reducedMotion || (delta === 0 && from.radius === radius)) {
      draw(turn, radius);
      return;
    }
    // React has written the new value's attributes; start from where the hand was.
    draw(from.turn, from.radius);
    animation.current = animate(0, 1, {
      ...spring,
      onUpdate: (progress) =>
        draw(from.turn + delta * progress, from.radius + (radius - from.radius) * progress),
      // A spring rests within a small distance of its target; end exactly on the value.
      onComplete: () => draw(turn, radius),
    });
  }, [turn, radius, follow, parts, reducedMotion, spring]);

  useEffect(() => () => animation.current?.stop(), []);
}

/**
 * Which faces to draw: the current one, and the one it replaced while that fades out
 * (Compose crossfades the hour and minute faces).
 */
function useFaces(minutes: boolean) {
  const [faces, setFaces] = useState<{ current: boolean; leaving: boolean | null }>({
    current: minutes,
    leaving: null,
  });
  if (faces.current !== minutes) setFaces({ current: minutes, leaving: faces.current });
  const clearLeaving = () => setFaces((previous) => ({ ...previous, leaving: null }));
  return { leaving: faces.leaving, clearLeaving };
}

function Dial({
  time,
  setTime,
  selection,
  onHourPicked,
  hourCycle,
  label,
  valueLabel,
  format,
  plain,
  styles,
  className,
}: {
  time: Time;
  setTime: (time: Time) => void;
  selection: 'hour' | 'minute';
  onHourPicked: () => void;
  hourCycle: 12 | 24;
  label: string;
  valueLabel: (value: string, total: number, unit: 'hours' | 'minutes') => string;
  /** A number as shown on the hour face (`minutes` false) or the minute face. */
  format: (n: number, minutes: boolean) => string;
  plain: (n: number) => string;
  styles: ReturnType<typeof timePickerStyles>;
  className?: string | undefined;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const numberRefs = useRef<(SVGGElement | null)[]>([]);
  const hand = useRef<{
    track: SVGLineElement | null;
    handle: SVGCircleElement | null;
    clip: SVGCircleElement | null;
  }>({ track: null, handle: null, clip: null });
  const pressing = useRef(false);
  // True while a press moves across the dial: the hand follows it without a spring.
  const dragging = useRef(false);
  const pendingFocus = useRef<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const { isFocusVisible } = useFocusVisible();
  const clipId = useId();
  const minutes = selection === 'minute';
  const { leaving, clearLeaving } = useFaces(minutes);
  const isPm = time.hour >= 12;
  const numbers = dialNumbers(minutes, hourCycle);

  const selectedTurn = minutes ? time.minute / 60 : (time.hour % 12) / 12;
  const selectedRadius =
    !minutes && hourCycle === 24 && time.hour >= 12 ? INNER_RADIUS : OUTER_RADIUS;
  const handle = pointOf(selectedTurn, selectedRadius);
  useDialHand(selectedTurn, selectedRadius, dragging, hand);
  const selectedValue = minutes ? time.minute : hourCycle === 24 ? time.hour : time.hour % 12 || 12;
  // The number Tab lands on: the chosen one, or the nearest five for other minutes.
  const tabStop = numbers.findIndex(({ value }) =>
    minutes ? value === (Math.round(time.minute / 5) * 5) % 60 : value === selectedValue,
  );

  // After an hour is chosen with the keyboard, focus follows to the chosen minute.
  useEffect(() => {
    if (pendingFocus.current === null) return;
    numberRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  });

  // The replaced face is gone once it has faded out (or at once without transitions).
  useEffect(() => {
    if (leaving === null) return;
    const timeout = window.setTimeout(clearLeaving, 1000);
    return () => window.clearTimeout(timeout);
  }, [leaving, clearLeaving]);

  const toTime = (value: number) =>
    minutes
      ? time.set({ minute: value })
      : time.set({ hour: hourCycle === 24 ? value : (value % 12) + (isPm ? 12 : 0) });

  const activate = (value: number) => {
    setTime(toTime(value));
    if (!minutes) {
      pendingFocus.current = Math.round(time.minute / 5) % 12;
      onHourPicked();
    }
  };

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * DIAL;
    const y = ((event.clientY - box.top) / box.height) * DIAL;
    const step = Math.round(turnOf(x, y) * 12) % 12;
    // Taps and drags pick minutes in fives (Compose); the keyboard and typing reach any minute.
    if (minutes) {
      setTime(time.set({ minute: step * 5 }));
      return;
    }
    const innerRing =
      hourCycle === 24 && Math.hypot(x - CENTER, y - CENTER) < INNER_RING_MAX_DISTANCE;
    const hour = hourCycle === 24 ? step + (innerRing ? 12 : 0) : step + (isPm ? 12 : 0);
    setTime(time.set({ hour }));
  };

  const onNumberKeyDown = (event: KeyboardEvent<SVGGElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate(numbers[index]!.value);
      return;
    }
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    // Clockwise through the values; a 24-hour face runs on from 11 to 12 on the inner ring.
    const next = (index + step + numbers.length) % numbers.length;
    setFocused(next);
    numberRefs.current[next]?.focus();
  };

  const total = minutes ? 60 : hourCycle;
  const unit = minutes ? 'minutes' : 'hours';
  const endPress = () => {
    pressing.current = false;
    dragging.current = false;
  };
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${DIAL} ${DIAL}`}
      role="group"
      aria-label={label}
      onPointerDown={(event) => {
        pressing.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (!pressing.current) return;
        dragging.current = true;
        pick(event);
      }}
      onPointerUp={() => {
        if (pressing.current && !minutes) onHourPicked();
        endPress();
      }}
      onPointerCancel={endPress}
      className={cn(styles.dial(), className)}
    >
      <defs>
        <clipPath id={clipId}>
          <circle
            ref={(element) => {
              hand.current.clip = element;
            }}
            cx={handle.x}
            cy={handle.y}
            r={HANDLE / 2}
          />
        </clipPath>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CENTER}
        data-slot="clock-dial"
        className={styles.dialFace()}
      />
      <line
        ref={(element) => {
          hand.current.track = element;
        }}
        x1={CENTER}
        y1={CENTER}
        x2={handle.x}
        y2={handle.y}
        strokeWidth={2}
        className={styles.dialTrack()}
      />
      <circle cx={CENTER} cy={CENTER} r={4} className={styles.dialHandle()} />
      <circle
        ref={(element) => {
          hand.current.handle = element;
        }}
        cx={handle.x}
        cy={handle.y}
        r={HANDLE / 2}
        data-slot="clock-dial-selector-handle"
        className={styles.dialHandle()}
      />
      {leaving !== null && (
        <g
          key={`leaving-${String(leaving)}`}
          aria-hidden="true"
          onTransitionEnd={clearLeaving}
          className={styles.dialFaceLeaving()}
        >
          {dialNumbers(leaving, hourCycle).map(({ value, turn, radius }, index) => {
            const point = pointOf(turn, radius);
            return (
              <text
                key={index}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.dialNumberText()}
              >
                {format(value, leaving)}
              </text>
            );
          })}
        </g>
      )}
      <g
        key={`face-${String(minutes)}`}
        className={leaving === null ? undefined : styles.dialFaceEntering()}
      >
        {numbers.map(({ value, turn, radius }, index) => {
          const point = pointOf(turn, radius);
          const selected = value === selectedValue && (minutes ? time.minute % 5 === 0 : true);
          return (
            <g
              key={index}
              ref={(element) => {
                numberRefs.current[index] = element;
              }}
              role="button"
              tabIndex={index === (focused ?? tabStop) ? 0 : -1}
              aria-label={valueLabel(plain(value), total, unit)}
              aria-pressed={selected}
              data-selected={selected || undefined}
              onFocus={() => setFocused(index)}
              onBlur={() => setFocused(null)}
              onKeyDown={(event) => onNumberKeyDown(event, index)}
              onClick={(event) => {
                // Assistive technology activates with a click that has no pointer behind it.
                if (event.detail === 0) activate(value);
              }}
              className={styles.dialNumber()}
            >
              <circle cx={point.x} cy={point.y} r={TARGET / 2} className={styles.dialNumberHit()} />
              {focused === index && isFocusVisible && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={TARGET / 2 - 1}
                  strokeWidth={3}
                  className={styles.dialFocus()}
                />
              )}
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                aria-hidden="true"
                data-selected={selected || undefined}
                className={styles.dialNumberText()}
              >
                {format(value, minutes)}
              </text>
            </g>
          );
        })}
        {/*
         * The numbers again in `on-primary`, clipped to the handle, so whatever part of a
         * number the handle covers reads on it (M3: the selected label is `on-primary`;
         * Compose blends the two layers the same way).
         */}
        <g aria-hidden="true" clipPath={`url(#${clipId})`} className="pointer-events-none">
          {numbers.map(({ value, turn, radius }, index) => {
            const point = pointOf(turn, radius);
            return (
              <text
                key={index}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.dialNumberOnHandle()}
              >
                {format(value, minutes)}
              </text>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
