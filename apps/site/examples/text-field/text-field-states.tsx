import { TextField } from '@windmorph/react';

/**
 * Required, disabled, read-only and error states. An invalid field shows an error icon and
 * its `errorMessage` (announced as an alert) in place of the supporting text, which stays
 * in the accessible description. Without a message, the supporting text turns the error
 * colour. A read-only field says so in its supporting text.
 */
export function TextFieldStates() {
  return (
    <div className="flex flex-wrap gap-4">
      <TextField label="Username" required supportingText="Required." />
      <TextField label="Account ID" defaultValue="AC-10293" readOnly supportingText="Read-only" />
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
