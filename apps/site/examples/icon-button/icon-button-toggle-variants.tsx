import { IconButton } from '@windmorph/react';
import { FavoriteFilledIcon, FavoriteIcon } from '../../components/icons';

/**
 * Toggle icon buttons in the four colour styles, unselected and then selected. Selected
 * standard icons turn `primary`, filled ones `primary`, tonal ones `secondary` and outlined
 * ones `inverse-surface`; each swaps to its `selectedIcon`.
 */
export function IconButtonToggleVariants() {
  const variants = ['filled', 'tonal', 'outlined', 'standard'] as const;
  return (
    <div className="flex flex-col gap-4">
      {[false, true].map((selected) => (
        <div key={String(selected)} className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <IconButton
              key={variant}
              toggle
              defaultSelected={selected}
              variant={variant}
              size="md"
              icon={<FavoriteIcon />}
              selectedIcon={<FavoriteFilledIcon />}
              aria-label={`Like (${variant})`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
