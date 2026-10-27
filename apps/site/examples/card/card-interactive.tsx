'use client';

import { Card } from '@windmorph/react';
import { useState } from 'react';

/**
 * The pressable and link forms. A pressable card (`onPress`) renders as
 * `<div role="button">`, a link card (`href`) as a link; both are named by their text, headline
 * first. Interactive cards fill their container and must not contain their own buttons or
 * links.
 */
export function CardInteractive() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Card variant="elevated" onPress={() => setCount((c) => c + 1)}>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Pressable card</h3>
          <p className="text-body-medium text-on-surface-variant">Pressed {count} times</p>
        </div>
      </Card>
      <Card variant="outlined" href="https://m3.material.io/components/cards">
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Link card</h3>
          <p className="text-body-medium text-on-surface-variant">Opens the M3 cards guidance</p>
        </div>
      </Card>
    </div>
  );
}
