/*
 * Track geometry, ported from Compose's `SliderDefaults.drawTrack` (Slider.kt) and the
 * thumb placement in `SliderImpl`, as CSS length expressions along the track's inline axis
 * (0 = the minimum end, 100% = the maximum end). Expressions use custom properties set by
 * the slider: `--m3-slider-corner` (the track corner) and `--m3-slider-gap-0` / `-1` (the
 * gap between each thumb and the track, 6px, 10px while focused). The thumb is 4px wide,
 * so a thumb's half plus its gap is `2px + gap`.
 *
 * Pure functions, so they can be unit-tested against Compose's drawing rules.
 */

export const CORNER = 'var(--m3-slider-corner)';
const gap = (thumb: 0 | 1) => `var(--m3-slider-gap-${thumb})`;
const halfAndGap = (thumb: 0 | 1) => `(2px + ${gap(thumb)})`;

export interface TrackSegment {
  tone: 'active' | 'inactive';
  /** Start and end along the track. */
  start: string;
  end: string;
  /** Compose draws a segment only when it is longer than this. */
  threshold: string;
  startRadius: string;
  endRadius: string;
  /** Draw the track's stop indicator at this segment's start / end. */
  stopAtStart?: boolean;
  stopAtEnd?: boolean;
  /** Which inset icon this segment holds (active start / inactive end). */
  icon?: 'start' | 'end';
}

export interface TrackTick {
  at: string;
  active: boolean;
}

export interface SliderGeometryInput {
  /** Thumb positions as fractions (one, or two for a range). */
  fractions: number[];
  /** Tick fractions (discrete sliders), including both ends; empty when continuous. */
  ticks: number[];
  centered: boolean;
}

/**
 * Where a fraction sits: Compose spreads discrete values between the corners, except at
 * the first and last ticks, so the thumb lines up with the stop indicators.
 */
export function positionOf(fraction: number, ticks: number[]): string {
  const onEnd = fraction === ticks[0] || fraction === ticks[ticks.length - 1];
  return ticks.length > 0 && !onEnd
    ? `calc(${CORNER} + (100% - 2 * ${CORNER}) * ${fraction})`
    : `calc(100% * ${fraction})`;
}

/** The CSS length of a segment, or 0 when Compose wouldn't draw it. */
export function segmentLength(segment: TrackSegment): string {
  const length = `(${segment.end} - ${segment.start})`;
  // min(length, max(0, (length − threshold) × 10⁴)) is the length when it exceeds the
  // threshold and 0 otherwise.
  return `max(0px, min(${length}, max(0px, (${length} - ${segment.threshold}) * 10000)))`;
}

export function trackGeometry({ fractions, ticks, centered }: SliderGeometryInput): {
  segments: TrackSegment[];
  ticks: TrackTick[];
  thumbs: string[];
} {
  const discrete = ticks.length > 0;
  const thumbs = fractions.map((fraction) => positionOf(fraction, ticks));
  const segments: TrackSegment[] = [];
  let activeRange: [number, number];

  if (fractions.length === 2) {
    const [start, end] = thumbs as [string, string];
    segments.push(
      {
        tone: 'inactive',
        start: '0px',
        end: `calc(${start} - ${halfAndGap(0)})`,
        threshold: CORNER,
        startRadius: CORNER,
        endRadius: '2px',
        stopAtStart: true,
      },
      {
        tone: 'active',
        start: `calc(${start} + ${halfAndGap(0)})`,
        end: `calc(${end} - ${halfAndGap(1)})`,
        threshold: '2px',
        startRadius: '2px',
        endRadius: '2px',
      },
      {
        tone: 'inactive',
        start: `calc(${end} + ${halfAndGap(1)})`,
        end: '100%',
        threshold: CORNER,
        startRadius: '2px',
        endRadius: CORNER,
        stopAtEnd: true,
      },
    );
    activeRange = [fractions[0]!, fractions[1]!];
  } else if (centered) {
    const fraction = fractions[0]!;
    const thumb = thumbs[0]!;
    // Compose shrinks corners in a centred track, so segments draw down to 0 length
    // (or the corner, with ticks). The gap at the centre omits the thumb's half.
    const threshold = discrete ? CORNER : '0px';
    const activeThreshold = discrete ? '2px' : '0px';
    const startGap = fraction <= 0.5 ? halfAndGap(0) : gap(0);
    const endGap = fraction >= 0.5 ? halfAndGap(0) : gap(0);
    segments.push({
      tone: 'inactive',
      start: '0px',
      end: fraction < 0.5 ? `calc(${thumb} - ${startGap})` : `calc(50% - ${startGap})`,
      threshold,
      startRadius: CORNER,
      endRadius: '2px',
      stopAtStart: true,
    });
    segments.push({
      tone: 'active',
      start: fraction < 0.5 ? `calc(${thumb} + ${startGap})` : '50%',
      end: fraction > 0.5 ? `calc(${thumb} - ${endGap})` : '50%',
      threshold: activeThreshold,
      startRadius: '2px',
      endRadius: '2px',
    });
    segments.push({
      tone: 'inactive',
      start: fraction > 0.5 ? `calc(${thumb} + ${endGap})` : `calc(50% + ${endGap})`,
      end: '100%',
      threshold,
      startRadius: '2px',
      endRadius: CORNER,
      stopAtEnd: true,
    });
    activeRange = [Math.min(fraction, 0.5), Math.max(fraction, 0.5)];
  } else {
    const thumb = thumbs[0]!;
    segments.push(
      {
        tone: 'active',
        start: '0px',
        end: `calc(${thumb} - ${halfAndGap(0)})`,
        threshold: CORNER,
        startRadius: CORNER,
        endRadius: '2px',
        icon: 'start',
      },
      {
        tone: 'inactive',
        start: `calc(${thumb} + ${halfAndGap(0)})`,
        end: '100%',
        threshold: CORNER,
        startRadius: '2px',
        endRadius: CORNER,
        stopAtEnd: true,
        icon: 'end',
      },
    );
    activeRange = [0, fractions[0]!];
  }

  // Ticks: the stop indicators replace the last tick (and the first, when both ends have
  // one); ticks under a thumb, or at the centre of a centred track, are left out.
  const hasStartStop = centered || fractions.length === 2;
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  const trackTicks = ticks
    .filter((tick, index) => {
      if (index === ticks.length - 1 || (hasStartStop && index === 0)) return false;
      if (fractions.some((fraction) => near(fraction, tick))) return false;
      return !(centered && near(tick, 0.5));
    })
    .map((tick) => ({
      at: `calc(${CORNER} + (100% - 2 * ${CORNER}) * ${tick})`,
      active: tick > activeRange[0] - 1e-9 && tick < activeRange[1] + 1e-9,
    }));

  return { segments, ticks: trackTicks, thumbs };
}
