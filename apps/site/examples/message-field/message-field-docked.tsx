'use client';

import { Card } from '@windmorph/react';
import { Avatar, MessageField } from '@windmorph/react-pro';

/**
 * A card's comment field: a pill until it's focused, then it opens and docks as the card's
 * footer, edge to edge with square corners (`docked="when-open"`). The card clips it to its
 * own rounded corners.
 */
export function MessageFieldDocked() {
  return (
    <Card variant="outlined" className="w-full max-w-md overflow-hidden">
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-title-medium text-on-surface">Bún chả night</h3>
        <p className="text-body-medium text-on-surface-variant">
          Friday at 7pm in the community kitchen. Who&apos;s bringing the herbs?
        </p>
      </div>
      <MessageField
        aria-label="Write a comment"
        placeholder="Write a comment…"
        leading={<Avatar name="Priya Shah" decorative size="sm" />}
        size="sm"
        expandOnFocus
        docked="when-open"
        clearOnSubmit
        onSubmit={() => undefined}
        className="px-3 pb-3"
      />
    </Card>
  );
}
