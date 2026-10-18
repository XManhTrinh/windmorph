import { Radio, RadioGroup } from '@windmorph/react';

/**
 * A whole group can be `disabled`, and an `invalid` group shows its `errorMessage` below
 * the options. M3 radios have no error colour of their own — the group carries the error.
 */
export function RadioGroupStates() {
  return (
    <div className="flex flex-col gap-6">
      <RadioGroup label="Plan" defaultValue="free" disabled>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>
      <RadioGroup
        label="Contact method"
        required
        invalid
        errorMessage="Choose how we should reach you."
      >
        <Radio value="email">Email</Radio>
        <Radio value="phone">Phone</Radio>
      </RadioGroup>
    </div>
  );
}
