import { TextField } from '@windmorph/react';

/**
 * A `multiline` field is an M3 text area: a `<textarea>` with a fixed height of `rows` lines
 * (4 by default) that scrolls, as M3 recommends on the web. `autoGrow` makes it grow from
 * `rows` up to `maxRows` instead. Setting `maxLength` shows a `count/max` character counter,
 * read to screen readers as the character count.
 */
export function TextFieldMultiline() {
  return (
    <div className="flex w-full flex-col gap-4">
      <TextField
        variant="outlined"
        label="Message"
        multiline
        maxLength={200}
        supportingText="Tell us what happened."
        className="w-full max-w-sm"
      />
      <TextField
        variant="outlined"
        label="Comment"
        multiline
        autoGrow
        maxRows={6}
        className="w-full max-w-sm"
      />
    </div>
  );
}
