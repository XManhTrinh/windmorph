import { TextField } from '@windmorph/react';

/**
 * The two variants. `filled` (the default) sits on a `surface-container-highest` fill;
 * `outlined` draws a 1px border with the label notched into it. Both float the label on
 * focus or when they hold a value.
 */
export function TextFieldVariants() {
  return (
    <div className="flex flex-wrap gap-4">
      <TextField label="Email" type="email" supportingText="We never share it." />
      <TextField variant="outlined" label="Full name" supportingText="As it appears on your ID." />
    </div>
  );
}
