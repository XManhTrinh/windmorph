'use client';

import { Button } from '@windmorph/react';
import {
  Avatar,
  CommentRow,
  ReactionPicker,
  ReactionSummary,
  type ReactionOption,
} from '@windmorph/react-pro';
import { useState } from 'react';

const REACTIONS: ReactionOption[] = [
  { id: 'like', label: 'Like', icon: '👍', color: 'primary' },
  { id: 'love', label: 'Love', icon: '❤️', color: 'error' },
  { id: 'haha', label: 'Haha', icon: '😆', color: 'warning' },
];

const COMMENTS = [
  { id: 'ada', name: 'Ada Lovelace', text: 'Is the workshop open to beginners?', reactions: 3 },
  { id: 'grace', name: 'Grace Hopper', text: 'Yes! Bring a laptop if you have one.', reactions: 1 },
];

/**
 * A thread: no gaps between comments, as each one's 48dp actions row spaces them. "Like" is a
 * word until there's a reaction (`showIdleIcon={false}`); the reactions so far sit at the end.
 */
export function CommentRowThread() {
  const [liked, setLiked] = useState<Record<string, string | null>>({});
  return (
    <ul className="flex w-full max-w-md flex-col">
      {COMMENTS.map((comment) => {
        const mine = liked[comment.id] ?? null;
        return (
          <CommentRow
            key={comment.id}
            as="li"
            avatar={<Avatar name={comment.name} size="sm" decorative />}
            bubble={
              <>
                <span className="text-label-large text-on-surface">{comment.name}</span>
                <span className="text-body-medium text-on-surface">{comment.text}</span>
              </>
            }
            actions={
              <>
                <time dateTime="2026-10-12T09:00:00Z" className="px-3">
                  2 min
                </time>
                <ReactionPicker
                  size="sm"
                  showIdleIcon={false}
                  options={REACTIONS}
                  value={mine}
                  onChange={(next) => setLiked((current) => ({ ...current, [comment.id]: next }))}
                />
                <Button variant="text" size="xs" className="text-on-surface-variant">
                  Reply
                </Button>
                <ReactionSummary
                  variant="chip"
                  size="sm"
                  items={[{ id: 'like', icon: '👍' }]}
                  total={comment.reactions + (mine ? 1 : 0)}
                />
              </>
            }
          />
        );
      })}
      <CommentRow
        as="li"
        isPending
        avatar={<Avatar name="Alan Turing" size="sm" decorative />}
        bubble={
          <>
            <span className="text-label-large text-on-surface">Alan Turing</span>
            <span className="text-body-medium text-on-surface">Count me in for Saturday.</span>
          </>
        }
        actions={<span className="px-3">Sending…</span>}
      />
    </ul>
  );
}
