'use client';

import { MediaUploadGrid, type MediaUploadItem } from '@windmorph/react-pro';
import { useEffect, useState } from 'react';
import { SAMPLE_PHOTOS } from './sample-photos';

const MAX_PHOTOS = 10;

/**
 * A post composer's photos. New files "upload" with progress (a timer stands in for the
 * server); the failed one uploads again on Retry. Drag to reorder, or use the menu.
 */
export function MediaUploadGridComposer() {
  const [items, setItems] = useState<MediaUploadItem[]>(() => [
    {
      key: 'sample-0',
      previewUrl: SAMPLE_PHOTOS[0]!.url,
      alt: SAMPLE_PHOTOS[0]!.alt,
      status: 'done',
    },
    {
      key: 'sample-1',
      previewUrl: SAMPLE_PHOTOS[1]!.url,
      alt: SAMPLE_PHOTOS[1]!.alt,
      status: 'done',
    },
    {
      key: 'sample-2',
      previewUrl: SAMPLE_PHOTOS[2]!.url,
      alt: SAMPLE_PHOTOS[2]!.alt,
      status: 'error',
      error: 'Connection lost',
    },
  ]);

  // The stand-in upload: every uploading photo gains 10% each 200ms.
  const uploading = items.some((item) => item.status === 'uploading');
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => {
      setItems((current) =>
        current.map((item) => {
          if (item.status !== 'uploading') return item;
          const progress = Math.min((item.progress ?? 0) + 0.1, 1);
          return progress >= 1
            ? { ...item, status: 'done', progress: undefined }
            : { ...item, progress };
        }),
      );
    }, 200);
    return () => clearInterval(timer);
  }, [uploading]);

  const move = (key: string, by: -1 | 1) =>
    setItems((current) => {
      const from = current.findIndex((item) => item.key === key);
      const to = from + by;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to]!, next[from]!];
      return next;
    });

  return (
    <div className="w-full max-w-[560px]">
      <MediaUploadGrid
        aria-label="Photos in your post"
        items={items}
        accept={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
        maxItems={MAX_PHOTOS}
        onAdd={(files) =>
          setItems((current) => [
            ...current,
            ...files.map((file) => ({
              key: crypto.randomUUID(),
              previewUrl: URL.createObjectURL(file),
              alt: file.name,
              status: 'uploading' as const,
              progress: 0,
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
        onRetry={(key) =>
          setItems((current) =>
            current.map((item) =>
              item.key === key
                ? { ...item, status: 'uploading', progress: 0, error: undefined }
                : item,
            ),
          )
        }
        itemActions={(_, index) => [
          ...(index > 0 ? [{ id: 'earlier', label: 'Move earlier' }] : []),
          ...(index < items.length - 1 ? [{ id: 'later', label: 'Move later' }] : []),
        ]}
        onItemAction={(key, action) => move(key, action === 'earlier' ? -1 : 1)}
      />
    </div>
  );
}
