'use client';

import { DENSITIES, IconButton, ThemeScope } from '@windmorph/react';
import { EditIcon, SearchIcon, ShareIcon, StarIcon } from '../../components/icons';

/**
 * Web density, 0 to -3: each step takes 4px off an icon button's height and width (a small
 * one is 40px at 0, 28px at -3), and its touch target stays 48 × 48px. M3 asks not to apply
 * density to icon buttons by default: set it on `ThemeProvider` from a setting, or for a
 * section with `ThemeScope`, as here.
 */
export function IconButtonDensity() {
  return (
    <div className="flex flex-col gap-4">
      {DENSITIES.map((density) => (
        // Layout on an inner element: a scope's classes also reach its overlays (the tooltips).
        <ThemeScope key={density} density={density}>
          <div className="flex items-center gap-4">
            <p className="w-24 text-title-small">{`Density ${density}`}</p>
            <IconButton icon={<SearchIcon />} aria-label="Search" />
            <IconButton variant="tonal" icon={<EditIcon />} aria-label="Edit" />
            <IconButton variant="outlined" icon={<ShareIcon />} aria-label="Share" />
            <IconButton variant="standard" icon={<StarIcon />} aria-label="Favourite" />
          </div>
        </ThemeScope>
      ))}
    </div>
  );
}
