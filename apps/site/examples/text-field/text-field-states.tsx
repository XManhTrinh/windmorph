import { TextField } from '@windmorph/react';

/**
 * Required, disabled, read-only and error states. An invalid field shows its
 * `errorMessage` in place of the supporting text, while the supporting text stays in the
 * accessible description.
 */
export function TextFieldStates() {
  return (
    <div className="flex flex-wrap gap-4">
      <TextField label="Username" required supportingText="Required." />
      <TextField label="Account ID" defaultValue="AC-10293" readOnly />
      <TextField label="Nickname" defaultValue="Taken" disabled />
      <TextField
        variant="outlined"
        label="Email"
        defaultValue="not-an-email"
        invalid
        errorMessage="Enter a valid email address."
      />
    </div>
  );
}
