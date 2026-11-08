'use client';

import { CopyField } from '@windmorph/react-pro';

/** A read-only value with a copy button, filled and outlined. */
export function CopyFieldVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <CopyField label="Invite link" value="https://example.com/invite/8f3a" />
      <CopyField
        variant="outlined"
        label="Project ID"
        value="prj_2Nd8"
        supportingText="Use it in your configuration file."
      />
    </div>
  );
}
