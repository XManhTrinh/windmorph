'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { listMediaStyles } from './list-styles';

/** What a {@link List} passes to the media in its items: `classNames.media`. */
export const ListMediaContext = createContext<string | undefined>(undefined);

interface MediaImageProps {
  /** The image. Without it, or when it fails to load, `fallback` shows. */
  src?: string | undefined;
  /** What the image shows; `""` when the headline already says it. */
  alt: string;
  srcSet?: string | undefined;
  sizes?: string | undefined;
  /**
   * Replaces the `<img>`, such as a framework's image component; the frame still sizes it
   * and crops it to fill.
   */
  children?: ReactNode;
  /** Shown with no `src` or when the image fails: an icon on `secondary-container`. */
  fallback?: ReactNode;
  className?: string;
}

export type ListItemImageProps = MediaImageProps;

export interface ListItemVideoProps extends MediaImageProps {
  /** The video's length, in its corner ("2:41"). */
  duration?: string;
  /** M3's small (100 × 56dp) or large (114 × 64dp) thumbnail. @default "small" */
  size?: 'small' | 'large';
}

function MediaImage({ src, alt, srcSet, sizes, children, fallback }: MediaImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  if (children != null) return children;
  if (src == null || failed === src) return fallback ?? null;
  return (
    <img
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      // An image that failed before hydration never fires `onError` here, so check on mount.
      // `decode()` confirms it: an SVG with no size also has no natural width, yet decodes.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) {
          img.decode().catch(() => setFailed(src));
        }
      }}
      onError={() => setFailed(src)}
    />
  );
}

/**
 * M3's leading image for a {@link ListItem}: a 56dp square with 8dp corners, cropped to
 * fill, with a `fallback` (an icon) when there's no image or it fails to load. Change its
 * shape with the list's `classNames.media` or `className`.
 *
 * @example
 * <ListItem key="1" leading={<ListItemImage src={url} alt="" fallback={<ArticleIcon />} />}>
 *   Dinner at our place
 * </ListItem>
 */
export function ListItemImage({ className, ...image }: ListItemImageProps) {
  const media = useContext(ListMediaContext);
  return (
    <span className={listMediaStyles({ kind: 'image' }).frame({ class: cn(media, className) })}>
      <MediaImage {...image} />
    </span>
  );
}

/**
 * M3's leading video for a {@link ListItem}: the video's thumbnail (not a player) with 8dp
 * corners, 100 × 56dp or 114 × 64dp (`size="large"`), with a play badge and its `duration`
 * in the corner. Pressing it is pressing the item.
 */
export function ListItemVideo({
  className,
  duration,
  size = 'small',
  ...image
}: ListItemVideoProps) {
  const media = useContext(ListMediaContext);
  const styles = listMediaStyles({ kind: 'video', size });
  return (
    <span className={styles.frame({ class: cn(media, className) })}>
      <MediaImage {...image} />
      <span aria-hidden="true" className={styles.badge()}>
        <svg viewBox="0 -960 960 960">
          <path d="M320-200v-560l440 280-440 280Z" />
        </svg>
      </span>
      {duration != null && <span className={styles.duration()}>{duration}</span>}
    </span>
  );
}

export interface ListItemAvatarProps {
  /** The person's photo. Without it, or when it fails to load, `children` show. */
  src?: string | undefined;
  /** What the photo shows; `""` (the default) when the headline names the person. */
  alt?: string;
  srcSet?: string | undefined;
  sizes?: string | undefined;
  /** Initials or an icon, shown with no `src` or when the photo fails; hidden from assistive tech. */
  children?: ReactNode;
  className?: string;
}

/**
 * M3's leading avatar for a {@link ListItem}: a 40dp circle in `primary-container` holding
 * a photo, cropped to fill, or initials in `title-medium` `on-primary-container`.
 *
 * @example
 * <ListItem key="alex" leading={<ListItemAvatar src={photo}>AL</ListItemAvatar>}>
 *   Alex Lee
 * </ListItem>
 */
export function ListItemAvatar({ className, alt = '', children, ...image }: ListItemAvatarProps) {
  const media = useContext(ListMediaContext);
  return (
    <span className={listMediaStyles({ kind: 'avatar' }).frame({ class: cn(media, className) })}>
      <MediaImage
        {...image}
        alt={alt}
        fallback={children != null ? <span aria-hidden="true">{children}</span> : null}
      />
    </span>
  );
}
