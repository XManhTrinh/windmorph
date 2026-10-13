'use client';

import { useRef, type CSSProperties, type ReactNode, type Ref, type RefObject } from 'react';
import {
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  useObjectRef,
  useSlider,
  useSliderThumb,
  VisuallyHidden,
} from 'react-aria';
import { useSliderState, type SliderState } from 'react-stately';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { segmentLength, trackGeometry, type TrackSegment } from './slider-geometry';
import { sliderStyles, type SliderOrientation, type SliderSize } from './slider-styles';

export interface SliderClassNames {
  root?: string;
  track?: string;
  thumb?: string;
  label?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface SliderCommonProps {
  /** @default "xs" (16px track) */
  size?: SliderSize;
  /** @default "horizontal". Vertical sliders run bottom to top and default to 240px tall. */
  orientation?: SliderOrientation;
  /** @default 0 */
  minValue?: number;
  /** @default 100 */
  maxValue?: number;
  /** @default 1 */
  step?: number;
  /** Discrete: show a stop indicator at every step (use a coarse `step`). @default false */
  ticks?: boolean;
  disabled?: boolean;
  /** Show the value above the thumb while it is dragged or keyboard-focused. @default false */
  showValueLabel?: boolean;
  /** Formats the value for the value indicator and assistive tech. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Form field name (one hidden input per thumb). */
  name?: string;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: SliderClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type SliderProps = SliderCommonProps &
  Naming & {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    /** Called when the user stops dragging or releases a key. */
    onChangeEnd?: (value: number) => void;
    /** Fill the track from its centre (for values around a midpoint). @default false */
    centered?: boolean;
    /** An icon inside the active track at its start (sizes md and up). */
    startIcon?: ReactNode;
    /** An icon inside the inactive track at its end (sizes md and up). */
    endIcon?: ReactNode;
  };

export type RangeSliderProps = SliderCommonProps &
  Naming & {
    value?: [number, number];
    defaultValue?: [number, number];
    onChange?: (value: [number, number]) => void;
    onChangeEnd?: (value: [number, number]) => void;
    /** Names of the two thumbs. @default ["Minimum", "Maximum"] */
    thumbLabels?: [string, string];
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
    size,
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
  const { centered = false, startIcon, endIcon } = props as SliderProps;
  const thumbLabels = (props as RangeSliderProps).thumbLabels ?? ['Minimum', 'Maximum'];
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

  const count = Math.round((maxValue - minValue) / step);
  const tickFractions =
    ticks && count > 0 ? Array.from({ length: count + 1 }, (_, i) => i / count) : [];
  const fractions = state.values.map((_, index) => state.getThumbPercent(index));
  const geometry = trackGeometry({ fractions, ticks: tickFractions, centered: centered && !range });
  const styles = sliderStyles({ size, orientation });

  return (
    <div
      {...mergeProps(data, groupProps)}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div {...trackProps} ref={trackRef} className={styles.track({ class: classNames?.track })}>
        {geometry.segments.map((segment, index) => (
          <Segment
            key={index}
            segment={segment}
            styles={styles}
            icon={
              segment.icon === 'start' ? startIcon : segment.icon === 'end' ? endIcon : undefined
            }
          />
        ))}
        {geometry.ticks.map((tick, index) => (
          <span
            key={index}
            aria-hidden="true"
            data-active={tick.active || undefined}
            style={{ marginInlineStart: `calc(${tick.at} - 2px)` }}
            className={styles.tick()}
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
            label={range ? thumbLabels[index] : undefined}
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
  icon,
}: {
  segment: TrackSegment;
  styles: ReturnType<typeof sliderStyles>;
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
        inlineSize:
          'min(var(--m3-slider-icon, 0px), max(0px, (100% - var(--m3-slider-icon, 0px) - 20px) * 10000))',
        marginInlineStart: segment.icon === 'start' ? '10px' : 'auto',
        marginInlineEnd: segment.icon === 'end' ? '10px' : undefined,
      }}
      className={styles.icon()}
    >
      {icon}
    </span>
  );
  // Stop indicators sit a corner's length in from the track's ends.
  const stop = (at: 'start' | 'end') => (
    <span
      aria-hidden="true"
      style={
        at === 'start'
          ? { marginInlineStart: 'calc(var(--m3-slider-corner) - 2px)' }
          : { marginInlineStart: 'auto', marginInlineEnd: 'calc(var(--m3-slider-corner) - 2px)' }
      }
      className={styles.stop()}
    />
  );
  return (
    <span
      data-tone={segment.tone}
      style={{ marginInlineStart: segment.start, inlineSize: segmentLength(segment), ...radius }}
      className={styles.segment()}
    >
      {segment.stopAtStart && stop('start')}
      {icon != null && iconBox}
      {/* An end icon takes the stop indicator's place. */}
      {segment.stopAtEnd && icon == null && stop('end')}
    </span>
  );
}

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
  const { thumbProps, inputProps, isDragging, isFocused } = useSliderThumb(
    { index, trackRef, inputRef, name, 'aria-label': label },
    state,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  // Compose narrows the handle to 2px while it is pressed, dragged or focused.
  const active = isDragging || isFocused;
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
        <span data-active={active || undefined} className={styles.handle()} />
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
        </VisuallyHidden>
      </div>
      {showValueLabel && (isDragging || isFocusVisible) && (
        <span aria-hidden="true" style={{ marginInlineStart: at }} className={styles.labelAnchor()}>
          <span className={styles.label({ class: classNames?.label })}>
            {state.getThumbValueLabel(index)}
          </span>
        </span>
      )}
    </>
  );
}
