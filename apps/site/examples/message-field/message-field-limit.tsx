'use client';

import { MessageField } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * A note with a limit: the counter shows from 90% of `maxLength` (or always, with
 * `showCounter`), turns to the error colour past it, and Send waits. Here Ctrl or ⌘ + Enter
 * sends (`submitOn="mod-enter"`), so Enter starts a new line, and a failed send shows the
 * error under the field.
 */
export function MessageFieldLimit() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <MessageField
        label="Note to the seller"
        description="Ctrl or ⌘ + Enter sends."
        defaultValue="Could you hold the bánh mì order until 6pm? I'll pick it up on the way home."
        maxLength={120}
        showCounter
        submitOn="mod-enter"
        minRows={2}
        onSubmit={() => setFailed(true)}
        invalid={failed}
        errorMessage="Couldn't send. Check your connection and try again."
        onChange={() => setFailed(false)}
      />
      <MessageField
        aria-label="Message"
        placeholder="Over the limit"
        defaultValue="This message is longer than the forty characters allowed."
        maxLength={40}
      />
    </div>
  );
}
