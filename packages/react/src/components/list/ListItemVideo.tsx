'use client';

import { useContext } from 'react';
import { formatClock, formatDurationWords } from '../../primitives/format-duration';
import { cn } from '../../utils/cn';
import { useLabels } from '../labels/use-labels';
import { useLocale } from '../locale/use-locale';
import { listMediaStyles } from './list-styles';
import { ListMediaContext, MediaImage, type MediaImageProps } from './ListMedia';

/*
 * The video thumbnail is its own module, so a list of images or avatars doesn't load the
 * duration's formatting, words and locale.
 */

/** Words a {@link ListItemVideo} says. */
export interface ListItemVideoLabels {
  /**
   * What assistive technology reads for a length given in seconds, from its words in the
   * page's language. @default (words) => `Length ${words}`
   */
  duration: (words: string) => string;
}

const DEFAULT_VIDEO_LABELS: ListItemVideoLabels = {
  duration: (words) => `Length ${words}`,
};

export interface ListItemVideoProps extends MediaImageProps {
  /**
   * The video's length, in its corner. In seconds, it shows as a clock in the locale's digits
   * ("2:41", "1:02:03") and is read in words ("Length 2 minutes, 41 seconds"); a negative or
   * unknown number shows nothing. A string is shown and read as written.
   */
  duration?: number | string;
  /** Words it says, with English defaults. A `LabelsProvider` sets them for the whole app. */
  labels?: Partial<ListItemVideoLabels>;
  /** M3's small (`sm`, 100 × 56dp) or large (`lg`, 114 × 64dp) thumbnail. @default "sm" */
  size?: 'sm' | 'lg';
}

/**
 * M3's leading video for a {@link ListItem}: the video's thumbnail (not a player) with 8dp
 * corners, 100 × 56dp or 114 × 64dp (`size="lg"`), with a play badge and its `duration`
 * in the corner. Pressing it is pressing the item.
 */
export function ListItemVideo({
  className,
  style,
  id,
  ref,
  duration,
  labels: labelsProp,
  size = 'sm',
  src,
  alt,
  srcSet,
  sizes,
  children,
  fallback,
  ...dom
}: ListItemVideoProps) {
  const media = useContext(ListMediaContext);
  const styles = listMediaStyles({ kind: 'video', size });
  const image = { src, alt, srcSet, sizes, children, fallback };
  return (
    <span
      {...dom}
      style={style}
      id={id}
      ref={ref}
      className={styles.frame({ class: cn(media, className) })}
    >
      <MediaImage {...image} />
      <span aria-hidden="true" className={styles.badge()}>
        <svg viewBox="0 -960 960 960">
          <path d="M320-200v-560l440 280-440 280Z" />
        </svg>
      </span>
      <VideoDuration duration={duration} labels={labelsProp} className={styles.duration()} />
    </span>
  );
}

/** A video's length in its corner: a string as written, or seconds as a clock and words. */
function VideoDuration({
  duration,
  labels: labelsProp,
  className,
}: {
  duration: number | string | undefined;
  labels: Partial<ListItemVideoLabels> | undefined;
  className: string;
}) {
  const labels = useLabels('ListItemVideo', DEFAULT_VIDEO_LABELS, labelsProp);
  const { locale } = useLocale();
  if (duration == null) return null;
  if (typeof duration === 'string') return <span className={className}>{duration}</span>;
  if (!Number.isFinite(duration) || duration < 0) return null;
  return (
    <span className={className}>
      {/* One text node for the words, so a link's name keeps the space before them. */}
      <span className="sr-only">{labels.duration(formatDurationWords(duration, locale))}</span>
      <span aria-hidden="true" dir="ltr">
        {formatClock(duration, locale)}
      </span>
    </span>
  );
}

