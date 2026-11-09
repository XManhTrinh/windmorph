'use client';

import { Button } from '@windmorph/react';
import { useState } from 'react';

const WIDTHS = [
  { id: 'wide', label: 'Wide', width: '100%' },
  { id: 'phone', label: 'Phone', width: '390px' },
] as const;

/** A block running alone in an iframe, so its scrolling and phone layout are the real ones. */
export function BlockPreview({ variation, title }: { variation: string; title: string }) {
  const [shown, setShown] = useState<(typeof WIDTHS)[number]['id']>('wide');
  const width = WIDTHS.find((entry) => entry.id === shown)!.width;
  return (
    <div className="flex w-full flex-col gap-3">
      <div role="group" aria-label={`${title}: preview width`} className="flex gap-2">
        {WIDTHS.map((entry) => (
          <Button
            key={entry.id}
            size="sm"
            variant={entry.id === shown ? 'tonal' : 'text'}
            aria-pressed={entry.id === shown}
            onPress={() => setShown(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
      </div>
      <iframe
        title={`${title} preview`}
        src={`/blocks-preview/${variation}`}
        loading="lazy"
        style={{ width }}
        className="mx-auto h-[560px] max-w-full rounded-corner-large border border-solid border-outline-variant bg-surface"
      />
    </div>
  );
}
