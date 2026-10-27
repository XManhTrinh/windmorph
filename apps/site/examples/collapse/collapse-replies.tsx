'use client';

import { Button } from '@windmorph/react';
import { Avatar, Collapse, MessageField } from '@windmorph/react-pro';
import { useRef, useState } from 'react';

const comments = [
  { id: 'alex', name: 'Alex Morgan', text: 'Is the workshop open to beginners?' },
  { id: 'priya', name: 'Priya Shah', text: 'I can bring the projector.' },
  { id: 'omar', name: 'Omar Haddad', text: 'Count me in for Saturday.' },
];

/**
 * One reply field at a time: replying to another comment folds this one as the next opens,
 * so the thread doesn't jump. The list opts out of scroll anchoring, so the page stays put.
 * Folding a field that holds focus (a reply sent, the banner closed) first hands focus back
 * to that comment's Reply button, so it never drops to the page.
 */
export function CollapseReplies() {
  const [replying, setReplying] = useState<string | null>(null);
  const replyButtons = useRef(new Map<string, HTMLButtonElement>());
  const fold = (id: string) => {
    replyButtons.current.get(id)?.focus();
    setReplying(null);
  };
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
              <Button
                ref={(element: HTMLButtonElement | null) => {
                  if (element) replyButtons.current.set(comment.id, element);
                  else replyButtons.current.delete(comment.id);
                }}
                variant="text"
                size="xs"
                onPress={() => setReplying(comment.id)}
              >
                Reply
              </Button>
            </div>
          </div>
          <Collapse open={replying === comment.id} classNames={{ content: 'ps-10' }}>
            {/* Spacing inside the collapse folds with it. */}
            <div className="mb-3.5">
              <MessageField
                aria-label={`Reply to ${comment.name}`}
                placeholder={`Reply to ${comment.name}…`}
                banner={`Replying to ${comment.name}`}
                onBannerClose={() => fold(comment.id)}
                expandOnFocus
                autoFocus
                onSubmit={() => fold(comment.id)}
              />
            </div>
          </Collapse>
        </li>
      ))}
    </ul>
  );
}
