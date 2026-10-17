'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useFocusRing,
  useLocale,
  useNumberFormatter,
  useObjectRef,
  useSlider,
  useSliderThumb,
  VisuallyHidden,
} from 'react-aria';
import { useSliderState, type SliderState } from 'react-stately';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { useTouchTrack } from './use-touch-track';
import {
  iconSizeWhenFits,
  movedStartIcon,
  segmentLength,
  trackGeometry,
  type TrackSegment,
} from './slider-geometry';
import { sliderStyles, type SliderOrientation, type SliderSize } from './slider-styles';

export interface SliderClassNames {
  /** The outer element. */
  root?: string;
  /** The track, holding the active and inactive segments and the stop indicators. */
  track?: string;
  /** Each active track segment (the filled part, from the start or the centre). */
  activeTrack?: string;
  /** Each inactive track segment. */
  inactiveTrack?: string;
  /** The stop indicators: at the track's ends, and at every step with `ticks`. */
  stop?: string;
  /** The inset icons (`startIcon`, `endIcon`). */
  icon?: string;
  /** Each thumb, the pressable area around its handle. */
  thumb?: string;
  /** The handle bar drawn inside each thumb. */
  handle?: string;
  /** The value indicator above a thumb (`showValueLabel`). */
  label?: string;
}

/** A slider needs a name: `aria-label`, or `aria-labelledby` pointing at a visible label. */
type Naming =
  | {
      /** Accessible name when there's no visible label. */
      'aria-label': string;
    }
  | {
      /** The id of the visible label that names the slider. */
      'aria-labelledby': string;
    };

interface SliderCommonProps {
  /** The track's thickness, from XS (a 16px track) to XL. @default "xs" */
  size?: SliderSize;
  /**
   * The direction the slider runs. Vertical sliders run bottom to top and default to 240px
   * tall. @default "horizontal"
   */
  orientation?: SliderOrientation;
  /** The lowest value. @default 0 */
  minValue?: number;
  /** The highest value. @default 100 */
  maxValue?: number;
  /** The amount the value changes by in one step. @default 1 */
  step?: number;
  /** Discrete: show a stop indicator at every step (use a coarse `step`). @default false */
  ticks?: boolean;
  /** Turns the slider off: it can't be moved or focused. @default false */
  disabled?: boolean;
  /** Show the value above the thumb while it is dragged or keyboard-focused. @default false */
  showValueLabel?: boolean;
  /** Formats the value for the value indicator and assistive tech. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Form field name (one hidden input per thumb). */
  name?: string;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: SliderClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type SliderProps = SliderCommonProps &
  Naming & {
    /** The value (controlled). */
    value?: number;
    /** The initial value when uncontrolled. @default minValue */
    defaultValue?: number;
    /** Called as the value changes, while dragging too. */
    onChange?: (value: number) => void;
    /** Called when the user stops dragging or releases a key. */
    onChangeEnd?: (value: number) => void;
    /**
     * Fill the track from its centre (for values around a midpoint). M3 doesn't use inset
     * icons on centred sliders, so `startIcon` and `endIcon` are ignored. @default false
     */
    centered?: boolean;
    /**
     * An icon inside the active track at its start (sizes md and up; ignored, with a dev
     * warning, on xs and sm). When the active track is too short for it, it moves to the
     * start of the inactive track.
     */
    startIcon?: ReactNode;
    /** An icon inside the inactive track at its end (sizes md and up; ignored on xs and sm). */
    endIcon?: ReactNode;
  };

export interface RangeSliderLabels {
  /** Name of the start thumb. @default "Minimum" */
  start: string;
  /** Name of the end thumb. @default "Maximum" */
  end: string;
}

const DEFAULT_LABELS: RangeSliderLabels = { start: 'Minimum', end: 'Maximum' };

export type RangeSliderProps = SliderCommonProps &
  Naming & {
    /** The range, as `[start, end]` (controlled). */
    value?: [number, number];
    /** The initial range when uncontrolled. @default [minValue, maxValue] */
    defaultValue?: [number, number];
    /** Called as the range changes, while dragging too. */
    onChange?: (value: [number, number]) => void;
    /** Called when the user stops dragging or releases a key. */
    onChangeEnd?: (value: [number, number]) => void;
    /** Words the range slider announces (its thumbs' names), with English defaults. */
    labels?: Partial<RangeSliderLabels>;
  };

/**
 * M3 Expressive slider: XS–XL sizes, horizontal or vertical, continuous or discrete with
 * stop indicators, optionally centred, with inset icons and a value indicator. Arrow keys,
 * Page Up / Down and Home / End adjust it (mirrored in RTL).
 *
 * @example
 * <Slider aria-label="Volume" size="md" startIcon={<VolumeIcon />} defaultValue={40} />
 */
export function Slider(props: SliderProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <SliderRoot {...props} range={false} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

/**
 * M3 Expressive range slider: two thumbs selecting a range, with the same sizes,
 * orientations and discrete stops as {@link Slider}.
 *
 * @example
 * <RangeSlider aria-label="Price" defaultValue={[20, 80]} />
 */
export function RangeSlider(props: RangeSliderProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <SliderRoot {...props} range directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

type RootProps = (SliderProps | RangeSliderProps) & {
  range: boolean;
  directionRef: (element: HTMLElement | null) => void;
};

function SliderRoot(props: RootProps) {
  const {
    size = 'xs',
    orientation = 'horizontal',
    minValue = 0,
    maxValue = 100,
    step = 1,
    ticks = false,
    disabled = false,
    showValueLabel = false,
    formatOptions,
    name,
    ref,
    className,
    style,
    classNames,
    range,
    directionRef,
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    ...rest
  } = props;
  const { centered = false, startIcon: startIconProp, endIcon: endIconProp } = props as SliderProps;
  // M3: only M, L and XL standard sliders take inset icons ("Avoid adding inset icons to XS
  // or S"; none on centred sliders).
  const iconSize = size === 'md' || size === 'lg' || size === 'xl';
  const startIcon = iconSize && !centered ? startIconProp : undefined;
  const endIcon = iconSize && !centered ? endIconProp : undefined;
  const labels = { ...DEFAULT_LABELS, ...(props as RangeSliderProps).labels };
  const { data, rest: labelling } = splitDataAttributes(rest);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = labelling as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };

  const numberFormatter = useNumberFormatter(formatOptions);
  // React Stately works with arrays; a single slider wraps and unwraps its number.
  const wrap = (v: number | [number, number] | undefined) =>
    v === undefined ? undefined : Array.isArray(v) ? v : [v];
  const unwrap = (v: number[]) => (range ? (v as [number, number]) : v[0]!);
  const ariaProps = {
    minValue,
    maxValue,
    step,
    orientation,
    isDisabled: disabled,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    value: wrap(value),
    defaultValue: wrap(defaultValue) ?? (range ? [minValue, maxValue] : [minValue]),
    onChange: onChange && ((v: number[]) => (onChange as (x: unknown) => void)(unwrap(v))),
    onChangeEnd: onChangeEnd && ((v: number[]) => (onChangeEnd as (x: unknown) => void)(unwrap(v))),
  };
  const state = useSliderState({ ...ariaProps, numberFormatter });
  const rootRef = useObjectRef(ref);
  const trackRef = useRef<HTMLDivElement>(null);
  const { groupProps, trackProps } = useSlider(ariaProps, state, trackRef);
  const { direction } = useLocale();
  const count = Math.round((maxValue - minValue) / step);
  const touchTrackProps = useTouchTrack(trackProps, {
    state,
    trackRef,
    orientation,
    direction,
    disabled,
    discrete: ticks && count > 0,
  });

  const tickFractions =
    ticks && count > 0 ? Array.from({ length: count + 1 }, (_, i) => i / count) : [];
  const fractions = state.values.map((_, index) => state.getThumbPercent(index));
  const geometry = trackGeometry({ fractions, ticks: tickFractions, centered: centered && !range });
  const styles = sliderStyles({ size, orientation });
  if (process.env.NODE_ENV !== 'production' && (startIconProp != null || endIconProp != null)) {
    if (centered) {
      console.warn(
        'Slider: inset icons are not used on centred sliders (M3), so they are ignored.',
      );
    } else if (!iconSize) {
      console.warn('Slider: inset icons need size md, lg or xl (M3), so they are ignored.');
    }
  }
  if (process.env.NODE_ENV !== 'production' && range && orientation === 'vertical') {
    console.warn('RangeSlider: M3 advises against vertical range sliders.');
  }
  const activeSegment = geometry.segments.find((segment) => segment.icon === 'start');
  const moved =
    activeSegment && startIcon != null && movedStartIcon(activeSegment, geometry.thumbs[0]!);

  return (
    <div
      {...mergeProps(data, groupProps)}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      data-tokens={mergeDataTokens('md-comp-slider', data)}
      data-size={size}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div
        {...touchTrackProps}
        ref={trackRef}
        className={styles.track({ class: classNames?.track })}
      >
        {geometry.segments.map((segment, index) => (
          <Segment
            key={index}
            segment={segment}
            styles={styles}
            classNames={classNames}
            icon={
              segment.icon === 'start' ? startIcon : segment.icon === 'end' ? endIcon : undefined
            }
          />
        ))}
        {moved && (
          <span
            aria-hidden="true"
            data-moved-icon=""
            style={{ marginInlineStart: moved.start, inlineSize: moved.size }}
            className={styles.movedIcon({ class: classNames?.icon })}
          >
            {startIcon}
          </span>
        )}
        {geometry.ticks.map((tick, index) => (
          <span
            key={index}
            aria-hidden="true"
            data-slot="stop-indicator"
            data-active={tick.active || undefined}
            style={{ marginInlineStart: `calc(${tick.at} - 2px)` }}
            className={styles.tick({ class: classNames?.stop })}
          />
        ))}
        {geometry.thumbs.map((at, index) => (
          <Thumb
            key={index}
            index={index as 0 | 1}
            at={at}
            state={state}
            trackRef={trackRef}
            name={name}
            label={range ? (index === 0 ? labels.start : labels.end) : undefined}
            showValueLabel={showValueLabel}
            styles={styles}
            classNames={classNames}
          />
        ))}
      </div>
    </div>
  );
}

function Segment({
  segment,
  styles,
  classNames,
  icon,
}: {
  segment: TrackSegment;
  styles: ReturnType<typeof sliderStyles>;
  classNames: SliderClassNames | undefined;
  icon: ReactNode;
}) {
  const radius = {
    borderStartStartRadius: segment.startRadius,
    borderEndStartRadius: segment.startRadius,
    borderStartEndRadius: segment.endRadius,
    borderEndEndRadius: segment.endRadius,
  };
  // Inset icons sit 10px inside and show only when the segment fits them (MDC).
  const iconBox = (
    <span
      aria-hidden="true"
      style={{
        inlineSize: iconSizeWhenFits('100%'),
        marginInlineStart: segment.icon === 'start' ? '10px' : 'auto',
        marginInlineEnd: segment.icon === 'end' ? '10px' : undefined,
      }}
      className={styles.icon({ class: classNames?.icon })}
    >
      {icon}
    </span>
  );
  // Stop indicators sit a corner's length in from the track's ends.
  const stop = (at: 'start' | 'end') => (
    <span
      aria-hidden="true"
      data-slot="stop-indicator"
      style={
        at === 'start'
          ? { marginInlineStart: 'calc(var(--m3-slider-corner) - 2px)' }
          : { marginInlineStart: 'auto', marginInlineEnd: 'calc(var(--m3-slider-corner) - 2px)' }
      }
      className={styles.stop({ class: classNames?.stop })}
    />
  );
  return (
    <span
      data-tone={segment.tone}
      data-slot={`${segment.tone}-track`}
      style={{ marginInlineStart: segment.start, inlineSize: segmentLength(segment), ...radius }}
      className={styles.segment({
        class: segment.tone === 'active' ? classNames?.activeTrack : classNames?.inactiveTrack,
      })}
    >
      {segment.stopAtStart && stop('start')}
      {icon != null && iconBox}
      {/* An end icon takes the stop indicator's place. */}
      {segment.stopAtEnd && icon == null && stop('end')}
    </span>
  );
}

/** Whether each arrow key increases the value (true) or decreases it (false), by direction. */
const INCREASE_KEYS: Record<'ltr' | 'rtl', Record<string, boolean>> = {
  ltr: { ArrowRight: true, ArrowUp: true, ArrowLeft: false, ArrowDown: false },
  rtl: { ArrowLeft: true, ArrowUp: true, ArrowRight: false, ArrowDown: false },
};

function Thumb({
  index,
  at,
  state,
  trackRef,
  name,
  label,
  showValueLabel,
  styles,
  classNames,
}: {
  index: 0 | 1;
  at: string;
  state: SliderState;
  trackRef: RefObject<HTMLDivElement | null>;
  name?: string;
  label?: string;
  showValueLabel: boolean;
  styles: ReturnType<typeof sliderStyles>;
  classNames?: SliderClassNames;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { thumbProps, inputProps, isDragging } = useSliderThumb(
    { index, trackRef, inputRef, name, 'aria-label': label },
    state,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { direction } = useLocale();
  // M3: "Space & Arrows — Increase and decrease the value by one interval", so arrows step
  // by React Aria's page size while Space is held (as Shift + arrows already do).
  const [spaceHeld, setSpaceHeld] = useState(false);
  const intervalKeys = {
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === ' ') {
        event.preventDefault();
        setSpaceHeld(true);
        return;
      }
      const increase = INCREASE_KEYS[direction][event.key];
      if (!spaceHeld || increase === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      state.setThumbDragging(index, true);
      if (increase) state.incrementThumb(index, state.pageSize);
      else state.decrementThumb(index, state.pageSize);
      state.setThumbDragging(index, false);
    },
    onKeyUp: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === ' ') setSpaceHeld(false);
    },
    onBlur: () => setSpaceHeld(false),
  };
  // The handle narrows to 2px while it is pressed or dragged (M3), or keyboard-focused.
  const active = isDragging || isFocusVisible;
  return (
    <>
      <div
        {...thumbProps}
        data-thumb={index}
        data-focus-visible={isFocusVisible || undefined}
        data-dragging={isDragging || undefined}
        style={{ marginInlineStart: `calc(${at} - 2px)` }}
        className={styles.thumb({ class: classNames?.thumb })}
      >
        <span
          data-slot="handle"
          data-active={active || undefined}
          className={styles.handle({ class: classNames?.handle })}
        />
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps, intervalKeys)} />
        </VisuallyHidden>
      </div>
      {showValueLabel && (isDragging || isFocusVisible) && (
        <span aria-hidden="true" style={{ marginInlineStart: at }} className={styles.labelAnchor()}>
          <span data-slot="value-indicator" className={styles.label({ class: classNames?.label })}>
            {state.getThumbValueLabel(index)}
          </span>
        </span>
      )}
    </>
  );
}
