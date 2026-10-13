import { TextField } from '@windmorph/react';

/**
 * A `multiline` field renders a `<textarea>` that grows with its content from `rows` up to
 * `maxRows`. Setting `maxLength` shows a `count/max` character counter below the field.
 */
export function TextFieldMultiline() {
  return (
    <TextField
      variant="outlined"
      label="Message"
      multiline
      rows={2}
      maxRows={6}
      maxLength={200}
      supportingText="Tell us what happened."
      className="w-full max-w-sm"
    />
  );
}
