'use client';

import { Button } from '@windmorph/react';
import { Avatar, Collapse, MessageField } from '@windmorph/react-pro';
import { useState } from 'react';

const comments = [
  { id: 'ada', name: 'Ada Lovelace', text: 'Is the workshop open to beginners?' },
  { id: 'grace', name: 'Grace Hopper', text: 'I can bring the projector.' },
  { id: 'alan', name: 'Alan Turing', text: 'Count me in for Saturday.' },
];

/**
 * One reply field at a time: replying to another comment folds this one as the next opens,
 * so the thread doesn't jump. The list opts out of scroll anchoring, so the page stays put.
 */
export function CollapseReplies() {
  const [replying, setReplying] = useState<string | null>(null);
  return (
    <ul className="flex w-full max-w-md flex-col [overflow-anchor:none]">
      {comments.map((comment) => (
        <li key={comment.id} className="flex flex-col">
          <div className="flex items-start gap-2">
            <Avatar name={comment.name} size="sm" decorative />
            <div className="flex min-w-0 flex-col items-start">
              <p className="rounded-corner-large bg-surface-container-highest px-3 py-2 text-body-medium text-on-surface">
                <span className="block text-label-large">{comment.name}</span>
                {comment.text}
              </p>
              <Button variant="text" size="xs" onPress={() => setReplying(comment.id)}>
                Reply
              </Button>
            </div>
          </div>
          <Collapse isOpen={replying === comment.id} classNames={{ content: 'ps-10' }}>
            {/* Spacing inside the collapse folds with it. */}
            <div className="mb-3.5">
              <MessageField
                aria-label={`Reply to ${comment.name}`}
                placeholder={`Reply to ${comment.name}…`}
                banner={`Replying to ${comment.name}`}
                onBannerClose={() => setReplying(null)}
                expandOnFocus
                autoFocus
                onSubmit={() => setReplying(null)}
              />
            </div>
          </Collapse>
        </li>
      ))}
    </ul>
  );
}
