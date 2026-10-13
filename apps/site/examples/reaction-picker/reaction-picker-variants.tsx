'use client';

import { ReactionPicker, type ReactionOption } from '@windmorph/react-pro';

const REACTIONS: ReactionOption[] = [
  { id: 'like', label: 'Like', icon: '👍', color: 'primary' },
  { id: 'love', label: 'Love', icon: '❤️', color: 'error' },
  { id: 'haha', label: 'Haha', icon: '😆', color: 'warning' },
];

/**
 * The `text` (default) and `tonal` buttons in both sizes, and one without an icon before
 * anyone reacts (`showIdleIcon={false}`).
 */
export function ReactionPickerVariants() {
  return (
    <div className="flex flex-col gap-4 pt-16">
      {(['text', 'tonal'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <ReactionPicker variant={variant} options={REACTIONS} />
          <ReactionPicker variant={variant} size="sm" options={REACTIONS} />
          <ReactionPicker variant={variant} showIdleIcon={false} options={REACTIONS} />
        </div>
      ))}
    </div>
  );
}
