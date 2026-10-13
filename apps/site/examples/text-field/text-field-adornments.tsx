import { TextField } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/**
 * Decorative leading / trailing icons sit in 48px boxes; a `prefix` and `suffix` sit
 * beside the input and appear once the label floats. They describe the input, read as
 * `prefixLabel` / `suffixLabel` when given.
 */
export function TextFieldAdornments() {
  return (
    <div className="flex flex-wrap gap-4">
      <TextField label="Search" leadingIcon={<SearchIcon />} />
      <TextField
        variant="outlined"
        label="Price"
        prefix="$"
        prefixLabel="US dollars"
        suffix="/mo"
        suffixLabel="per month"
        inputMode="decimal"
      />
    </div>
  );
}
