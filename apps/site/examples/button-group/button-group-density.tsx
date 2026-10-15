'use client';

import { ButtonGroup, DENSITIES, IconButton, ThemeScope } from '@windmorph/react';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon } from '../../components/icons';

/**
 * A button group adapts to the density of the icon buttons inside (M3): under a dense
 * `ThemeScope` (or `ThemeProvider`) they get 4px smaller a step and the group keeps its gaps,
 * so their 48px touch targets never reach a neighbour.
 */
export function ButtonGroupDensity() {
  return (
    <div className="flex flex-col gap-4">
      {DENSITIES.map((density) => (
        // Layout on an inner element: a scope's classes also reach its overlays (the tooltips).
        <ThemeScope key={density} density={density}>
          <div className="flex items-center gap-4">
            <p className="w-24 text-title-small">{`Density ${density}`}</p>
            <ButtonGroup buttonVariant="tonal" aria-label={`Formatting, density ${density}`}>
              <IconButton icon={<FormatBoldIcon />} aria-label="Bold" />
              <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
              <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" />
            </ButtonGroup>
          </div>
        </ThemeScope>
      ))}
    </div>
  );
}
