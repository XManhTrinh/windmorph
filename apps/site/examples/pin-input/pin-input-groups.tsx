'use client';

import { PinInput } from '@windmorph/react-pro';

/**
 * `groups` splits the boxes; the value is always the plain code. Letter codes are
 * upper-cased, and `pattern` can leave out look-alike characters.
 */
export function PinInputGroups() {
  return (
    <div className="flex flex-col gap-6">
      <PinInput label="One group" defaultValue="123456" otp={false} />
      <PinInput label="Pairs" groups={[2, 2, 2]} defaultValue="123456" otp={false} />
      <PinInput
        label="Voucher code"
        length={8}
        size="sm"
        type="alphanumeric"
        groups={[4, 4]}
        defaultValue="SAVE"
        otp={false}
      />
      <PinInput
        label="Invite code (no 0, O, 1 or I)"
        type="alphanumeric"
        pattern={/[2-9A-HJ-NP-Z]/}
        groups={[3, 3]}
        separator="·"
        otp={false}
      />
    </div>
  );
}
