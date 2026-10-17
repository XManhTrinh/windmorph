import { ButtonGroup, IconButton } from '@windmorph/react';
import { FormatBoldIcon, FormatItalicIcon } from '../../components/icons';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/**
 * The five sizes, which the group passes to its buttons. Standard groups space their buttons
 * 18 / 12 / 8 / 8 / 8px apart; connected ones keep a 2px gap at every size. Round is the
 * default shape; `shape="square"` squares the connected group's corners. The connected
 * groups select (toggle buttons with a value), as connected groups do. Two buttons a group, so
 * even XL fits a phone.
 */
export function ButtonGroupSizes() {
  return (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-6">
          <ButtonGroup size={size} aria-label={`Text format, ${size}`}>
            <IconButton variant="tonal" icon={<FormatBoldIcon />} aria-label="Bold" />
            <IconButton variant="tonal" icon={<FormatItalicIcon />} aria-label="Italic" />
          </ButtonGroup>
          <ButtonGroup
            variant="connected"
            shape={size === 'xs' || size === 'sm' ? 'round' : 'square'}
            size={size}
            selectionMode="multiple"
            aria-label={`Text format, connected, ${size}`}
            className="w-fit"
          >
            <IconButton
              toggle
              value="bold"
              variant="tonal"
              icon={<FormatBoldIcon />}
              aria-label="Bold"
            />
            <IconButton
              toggle
              value="italic"
              variant="tonal"
              icon={<FormatItalicIcon />}
              aria-label="Italic"
            />
          </ButtonGroup>
        </div>
      ))}
    </div>
  );
}
