'use client';

import { Time } from '@internationalized/date';
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from 'react';
import { mergeProps, useFocusRing, useLocale, useNumberFormatter } from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { timePickerStyles } from './time-picker-styles';

/** Compose's clock geometry (TimePicker.kt), in px on the 256px dial. */
const DIAL = 256;
const CENTER = DIAL / 2;
const OUTER_RADIUS = 101;
const INNER_RADIUS = 69;
const HANDLE = 48;

export interface TimePickerStrings {
  /** @default "Hour" */
  hour?: string;
  /** @default "Minute" */
  minute?: string;
  /** @default "AM" */
  am?: string;
  /** @default "PM" */
  pm?: string;
  /** Name of the dial. @default "Clock" */
  dial?: string;
}

export interface TimePickerClassNames {
  root?: string;
  dial?: string;
}

export interface TimePickerProps {
  /** Controlled time (`@internationalized/date` `Time`). */
  value?: Time;
  /** @default 12:00 */
  defaultValue?: Time;
  onChange?: (value: Time) => void;
  /** 12- or 24-hour clock. Defaults to the locale's. */
  hourCycle?: 12 | 24;
  /** The clock dial, or typed hour and minute fields. @default "dial" */
  mode?: 'dial' | 'input';
  strings?: TimePickerStrings;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: TimePickerClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

function localeHourCycle(locale: string): 12 | 24 {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
}

/**
 * M3 time picker (Compose's `TimePicker` and `TimeInput`): hour and minute selectors with an
 * AM / PM selector, and a clock dial you drag or press (switching to minutes after the
 * hour), or typed fields in input mode. Put it in a {@link PickerDialog} for the modal form.
 *
 * @example
 * <TimePicker value={time} onChange={setTime} />
 */
export function TimePicker({
  value,
  defaultValue,
  onChange,
  hourCycle: hourCycleProp,
  mode = 'dial',
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
  const [selection, setSelection] = useState<'hour' | 'minute'>('hour');
  const styles = timePickerStyles({ hourCycle, mode });
  const pad = useNumberFormatter({ minimumIntegerDigits: 2, useGrouping: false });
  const plain = useNumberFormatter({ useGrouping: false });
  const isPm = time.hour >= 12;
  const displayHour = hourCycle === 24 ? time.hour : time.hour % 12 || 12;
  const hourText = hourCycle === 24 ? pad.format(displayHour) : plain.format(displayHour);
  const setPeriod = (pm: boolean) => {
    if (pm !== isPm) setTime(time.set({ hour: (time.hour + 12) % 24 }));
  };

  return (
    <div
      {...data}
      ref={ref}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div className={styles.display()}>
        {mode === 'dial' ? (
          <>
            <Selector
              label={strings.hour ?? 'Hour'}
              text={hourText}
              selected={selection === 'hour'}
              onPress={() => setSelection('hour')}
              className={styles.selector()}
            />
            <span aria-hidden="true" className={styles.separator()}>
              :
            </span>
            <Selector
              label={strings.minute ?? 'Minute'}
              text={pad.format(time.minute)}
              selected={selection === 'minute'}
              onPress={() => setSelection('minute')}
              className={styles.selector()}
            />
          </>
        ) : (
          <>
            <NumberField
              label={strings.hour ?? 'Hour'}
              value={displayHour}
              min={hourCycle === 24 ? 0 : 1}
              max={hourCycle === 24 ? 23 : 12}
              format={(n) => (hourCycle === 24 ? pad.format(n) : plain.format(n))}
              onCommit={(hour) =>
                setTime(time.set({ hour: hourCycle === 24 ? hour : (hour % 12) + (isPm ? 12 : 0) }))
              }
              styles={styles}
            />
            <span aria-hidden="true" className={styles.separator()}>
              :
            </span>
            <NumberField
              label={strings.minute ?? 'Minute'}
              value={time.minute}
              min={0}
              max={59}
              format={(n) => pad.format(n)}
              onCommit={(minute) => setTime(time.set({ minute }))}
              styles={styles}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div role="radiogroup" aria-label="AM or PM" className={styles.period()}>
            {[false, true].map((pm) => (
              <PeriodOption
                key={String(pm)}
                label={pm ? (strings.pm ?? 'PM') : (strings.am ?? 'AM')}
                selected={isPm === pm}
                onSelect={() => setPeriod(pm)}
                className={styles.periodOption()}
              />
            ))}
          </div>
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
          format={(n) =>
            selection === 'minute' || hourCycle === 24 ? pad.format(n) : plain.format(n)
          }
          styles={styles}
          className={classNames?.dial}
        />
      )}
    </div>
  );
}

function Selector({
  label,
  text,
  selected,
  onPress,
  className,
}: {
  label: string;
  text: string;
  selected: boolean;
  onPress: () => void;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { interactionProps, dataAttributes } = useM3Interaction({}, ref);
  return (
    <button
      {...mergeProps(interactionProps, { onClick: onPress })}
      {...dataAttributes}
      ref={ref}
      type="button"
      aria-label={`${label} ${text}`}
      aria-pressed={selected}
      data-selected={selected || undefined}
      className={className}
    >
      {text}
    </button>
  );
}

function PeriodOption({
  label,
  selected,
  onSelect,
  className,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { interactionProps, dataAttributes } = useM3Interaction({}, ref);
  return (
    <button
      {...mergeProps(interactionProps, { onClick: onSelect })}
      {...dataAttributes}
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      data-selected={selected || undefined}
      className={className}
    >
      {label}
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  format,
  onCommit,
  styles,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  format: (n: number) => string;
  onCommit: (value: number) => void;
  styles: ReturnType<typeof timePickerStyles>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = draft === null ? value : Number(draft);
  const invalid =
    draft !== null && (draft === '' || Number.isNaN(parsed) || parsed < min || parsed > max);
  return (
    <label className={styles.fieldColumn()}>
      <input
        inputMode="numeric"
        aria-label={label}
        aria-invalid={invalid || undefined}
        maxLength={2}
        value={draft ?? format(value)}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const text = event.target.value.replace(/\D/g, '');
          setDraft(text);
          const next = Number(text);
          if (text !== '' && next >= min && next <= max) onCommit(next);
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
        className={styles.field()}
      />
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

function Dial({
  time,
  setTime,
  selection,
  onHourPicked,
  hourCycle,
  label,
  format,
  styles,
  className,
}: {
  time: Time;
  setTime: (time: Time) => void;
  selection: 'hour' | 'minute';
  onHourPicked: () => void;
  hourCycle: 12 | 24;
  label: string;
  format: (n: number) => string;
  styles: ReturnType<typeof timePickerStyles>;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const { focusProps, isFocusVisible } = useFocusRing();
  const minutes = selection === 'minute';
  const isPm = time.hour >= 12;

  // Numbers on the face: minutes in fives, hours 12 / 1–11, plus 12–23 inside for 24 hours.
  const outer = minutes
    ? Array.from({ length: 12 }, (_, i) => ({ value: i * 5, turn: i / 12, radius: OUTER_RADIUS }))
    : Array.from({ length: 12 }, (_, i) => ({
        value: hourCycle === 24 ? i : i || 12,
        turn: i / 12,
        radius: OUTER_RADIUS,
      }));
  const inner =
    !minutes && hourCycle === 24
      ? Array.from({ length: 12 }, (_, i) => ({
          value: i + 12,
          turn: i / 12,
          radius: INNER_RADIUS,
        }))
      : [];

  const selectedTurn = minutes ? time.minute / 60 : (time.hour % 12) / 12;
  const selectedRadius =
    !minutes && hourCycle === 24 && time.hour >= 12 ? INNER_RADIUS : OUTER_RADIUS;
  const handle = pointOf(selectedTurn, selectedRadius);
  const selectedValue = minutes ? time.minute : hourCycle === 24 ? time.hour : time.hour % 12 || 12;

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * DIAL;
    const y = ((event.clientY - box.top) / box.height) * DIAL;
    const turn = turnOf(x, y);
    if (minutes) {
      setTime(time.set({ minute: Math.round(turn * 60) % 60 }));
      return;
    }
    const step = Math.round(turn * 12) % 12;
    const distance = Math.hypot(x - CENTER, y - CENTER);
    const innerRing = hourCycle === 24 && distance < (OUTER_RADIUS + INNER_RADIUS) / 2;
    const hour = hourCycle === 24 ? step + (innerRing ? 12 : 0) : step + (isPm ? 12 : 0);
    setTime(time.set({ hour }));
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    if (minutes) setTime(time.set({ minute: (time.minute + step + 60) % 60 }));
    else if (hourCycle === 24) setTime(time.set({ hour: (time.hour + step + 24) % 24 }));
    else setTime(time.set({ hour: (((time.hour % 12) + step + 12) % 12) + (isPm ? 12 : 0) }));
  };

  return (
    <svg
      {...focusProps}
      ref={svgRef}
      viewBox={`0 0 ${DIAL} ${DIAL}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={minutes ? 0 : hourCycle === 24 ? 0 : 1}
      aria-valuemax={minutes ? 59 : hourCycle === 24 ? 23 : 12}
      aria-valuenow={selectedValue}
      aria-valuetext={minutes ? `${selectedValue} minutes` : `${selectedValue} o'clock`}
      data-focus-visible={isFocusVisible || undefined}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => dragging.current && pick(event)}
      onPointerUp={() => {
        if (dragging.current && !minutes) onHourPicked();
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={onKeyDown}
      className={cn(styles.dial(), className)}
    >
      <circle cx={CENTER} cy={CENTER} r={CENTER} className={styles.dialFace()} />
      <line
        x1={CENTER}
        y1={CENTER}
        x2={handle.x}
        y2={handle.y}
        strokeWidth={2}
        className={styles.dialTrack()}
      />
      <circle cx={CENTER} cy={CENTER} r={4} className={styles.dialHandle()} />
      <circle cx={handle.x} cy={handle.y} r={HANDLE / 2} className={styles.dialHandle()} />
      {[...outer, ...inner].map(({ value, turn, radius }) => {
        const point = pointOf(turn, radius);
        const selected = value === selectedValue && (minutes ? time.minute % 5 === 0 : true);
        return (
          <text
            key={`${radius}-${value}`}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="central"
            aria-hidden="true"
            data-selected={selected || undefined}
            className={styles.dialNumber()}
          >
            {format(value)}
          </text>
        );
      })}
    </svg>
  );
}
