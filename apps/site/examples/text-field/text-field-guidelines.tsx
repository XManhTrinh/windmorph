import { TextField } from '@windmorph/react';

/** Do: the error text takes the place of the supporting text. */
export function TextFieldDoErrorSwap() {
  return (
    <TextField
      variant="outlined"
      label="Email"
      defaultValue="sam@example"
      supportingText="We'll send the receipt here."
      invalid
      errorMessage="Enter a valid email address."
      className="w-full max-w-72"
    />
  );
}

/** Don't: an error line added under the supporting text. */
export function TextFieldDontErrorAdded() {
  return (
    <div className="flex w-full max-w-72 flex-col gap-1">
      <TextField
        variant="outlined"
        label="Email"
        defaultValue="sam@example"
        supportingText="We'll send the receipt here."
        invalid
      />
      <p className="px-4 text-body-small text-error">Enter a valid email address.</p>
    </div>
  );
}

/** Do: a short label that stays on one line. */
export function TextFieldDoShortLabel() {
  return <TextField label="Work email" className="w-full max-w-72" />;
}

/** Don't: a label too long for the field. */
export function TextFieldDontLongLabel() {
  return (
    <TextField
      label="The email address you use for work and for receipts"
      className="w-full max-w-72"
    />
  );
}
