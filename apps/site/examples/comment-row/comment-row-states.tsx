import { Button } from '@windmorph/react';
import { Avatar, CommentRow } from '@windmorph/react-pro';
import { SAMPLE_PHOTOS } from '../media-viewer/sample-photos';

const PHOTO = SAMPLE_PHOTOS[3]!;

/**
 * A comment with a photo below its bubble (`below`), and a removed comment only its writer
 * still sees (`variant="outlined"`, a dashed bubble). Each is an `article` named by the app.
 */
export function CommentRowStates() {
  return (
    <div className="flex w-full max-w-md flex-col">
      <CommentRow
        as="article"
        aria-label="Comment by Priya Shah"
        avatar={<Avatar name="Priya Shah" size="sm" decorative />}
        bubble={
          <>
            <span className="text-label-large text-on-surface">Priya Shah</span>
            <span className="text-body-medium text-on-surface">
              Lunch today, still thinking about it.
            </span>
          </>
        }
        below={
          <img
            src={PHOTO.src}
            alt={PHOTO.alt}
            width={160}
            height={160}
            className="size-40 rounded-corner-large object-cover"
          />
        }
        actions={
          <>
            <time dateTime="2026-10-12T12:30:00Z" className="px-3">
              1 h
            </time>
            <Button variant="text" size="xs" className="text-on-surface-variant">
              Reply
            </Button>
          </>
        }
      />
      <CommentRow
        as="article"
        aria-label="Your removed comment"
        variant="outlined"
        avatar={<Avatar name="Sam Taylor" size="sm" decorative />}
        bubble={
          <>
            <span className="text-label-large text-on-surface">Sam Taylor</span>
            <span className="text-body-medium text-on-surface-variant">
              This comment was removed. Only you can see it.
            </span>
          </>
        }
        actions={<span className="px-3">Removed</span>}
      />
    </div>
  );
}
