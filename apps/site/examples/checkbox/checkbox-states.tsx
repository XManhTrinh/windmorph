import { Checkbox } from '@windmorph/react';

/**
 * Disabled and error states. An `invalid` checkbox uses the error colours; disabled
 * checkboxes keep their checked or unchecked appearance at reduced opacity.
 */
export function CheckboxStates() {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox defaultSelected disabled>
        Disabled, checked
      </Checkbox>
      <Checkbox disabled>Disabled, unchecked</Checkbox>
      <Checkbox invalid required>
        Please accept to continue
      </Checkbox>
    </div>
  );
}
