'use client';

import { Switch } from '@windmorph/react';
import { MediaUploadGrid, type MediaUploadItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from './sample-photos';

const ITEMS: MediaUploadItem[] = SAMPLE_PHOTOS.map((photo, index) => ({
  key: `sending-${index}`,
  previewUrl: photo.url,
  alt: photo.alt,
  status: 'done',
}));

/**
 * While the post is being sent, `disabled` stops adding, dropping, reordering and every
 * button, so the photos can't change under the request.
 */
export function MediaUploadGridDisabled() {
  const [sending, setSending] = useState(true);
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-4">
      <Switch checked={sending} onCheckedChange={setSending}>
        Sending the post
      </Switch>
      <MediaUploadGrid
        aria-label="Photos in your post"
        items={ITEMS}
        disabled={sending}
        onAdd={() => undefined}
        onRemove={() => undefined}
        onReorder={() => undefined}
      />
    </div>
  );
}
