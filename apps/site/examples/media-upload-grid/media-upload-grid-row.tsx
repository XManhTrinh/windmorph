'use client';

import { MediaUploadGrid, type MediaUploadItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from './sample-photos';

/** One scrolling row, as above a message field, taking up to four photos. */
export function MediaUploadGridRow() {
  const [items, setItems] = useState<MediaUploadItem[]>(() =>
    SAMPLE_PHOTOS.slice(0, 3).map((photo, index) => ({
      key: `row-${index}`,
      previewUrl: photo.url,
      alt: photo.alt,
      status: 'done',
    })),
  );
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-2">
      <MediaUploadGrid
        aria-label="Photos to send"
        layout="row"
        items={items}
        accept={['image/*']}
        maxItems={4}
        onAdd={(files) =>
          setItems((current) => [
            ...current,
            ...files.map((file) => ({
              key: crypto.randomUUID(),
              previewUrl: URL.createObjectURL(file),
              alt: file.name,
              status: 'done' as const,
            })),
          ])
        }
        onReorder={(keys) =>
          setItems((current) => keys.map((key) => current.find((item) => item.key === key)!))
        }
        onRemove={(key) =>
          setItems((current) => {
            const removed = current.find((item) => item.key === key);
            if (removed?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(removed.previewUrl);
            return current.filter((item) => item.key !== key);
          })
        }
      />
      <p className="text-body-medium text-on-surface-variant">{items.length} of 4 photos</p>
    </div>
  );
}
