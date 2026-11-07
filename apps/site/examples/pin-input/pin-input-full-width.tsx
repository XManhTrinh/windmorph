'use client';

import { PinInput } from '@windmorph/react-pro';

/**
 * `fullWidth` spans the field's container, as the other fields in a form column do: the boxes
 * share the width equally (never narrower than 32px) and the separator keeps its width. Limit
 * it with a `max-w-*` in `className`.
 */
export function PinInputFullWidth() {
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-6">
      <PinInput label="6-digit code" fullWidth groups={[3, 3]} />
      <PinInput label="PIN" fullWidth length={4} variant="filled" mask otp={false} />
    </div>
  );
}
