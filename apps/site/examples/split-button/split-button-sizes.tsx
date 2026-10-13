'use client';

import { Menu, MenuItem, SplitButton } from '@windmorph/react';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/**
 * The five sizes, XS to XL, here with a label only. Inner corners and the chevron's offset
 * grow with the size; each half keeps a 48px touch target.
 */
export function SplitButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {SIZES.map((size) => (
        <SplitButton
          key={size}
          size={size}
          variant="tonal"
          menuLabel={`More save options (${size})`}
          menu={
            <Menu>
              <MenuItem key="copy">Save a copy</MenuItem>
              <MenuItem key="template">Save as template</MenuItem>
            </Menu>
          }
        >
          Save
        </SplitButton>
      ))}
    </div>
  );
}
