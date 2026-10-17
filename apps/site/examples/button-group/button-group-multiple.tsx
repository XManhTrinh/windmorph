import { ButtonGroup, IconButton } from '@windmorph/react';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon } from '../../components/icons';

/**
 * Multiple selection lets several toggle buttons be chosen at once, like checkboxes. Here
 * icon buttons form a square text-format group; `defaultSelectedKeys` seeds the initial
 * state. Connected groups span their container; `w-fit` keeps this one compact.
 */
export function ButtonGroupMultiple() {
  return (
    <ButtonGroup
      variant="connected"
      shape="square"
      selectionMode="multiple"
      defaultSelectedKeys={['bold']}
      aria-label="Text format"
      className="w-fit"
    >
      <IconButton toggle variant="tonal" value="bold" icon={<FormatBoldIcon />} aria-label="Bold" />
      <IconButton
        toggle
        variant="tonal"
        value="italic"
        icon={<FormatItalicIcon />}
        aria-label="Italic"
      />
      <IconButton
        toggle
        variant="tonal"
        value="underline"
        icon={<FormatUnderlinedIcon />}
        aria-label="Underline"
      />
    </ButtonGroup>
  );
}
