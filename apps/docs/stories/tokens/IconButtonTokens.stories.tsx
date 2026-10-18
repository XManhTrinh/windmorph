import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, type ButtonSize, type IconButtonVariant } from '@windmorph/react';
import { StarIcon, StarOutlineIcon } from '../icons';
import { TokenProbe } from './probe';

const VARIANTS: IconButtonVariant[] = ['standard', 'filled', 'tonal', 'outlined'];
const SIZES: ButtonSize[] = ['xs', 'md', 'lg', 'xl'];

/** IconButton's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-icon-button',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/*
 * Per variant: a resting icon button, then an unselected toggle, marked `data-unselected`
 * for the unselected tokens, and a selected one. The variants are small; each other size
 * has a resting round icon button and a selected round toggle, which takes the square shape.
 */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap gap-4">
              <IconButton variant={variant} icon={<StarOutlineIcon />} aria-label={variant} />
              <IconButton
                toggle
                variant={variant}
                data-unselected=""
                icon={<StarOutlineIcon />}
                selectedIcon={<StarIcon />}
                aria-label="Unselected"
              />
              <IconButton
                toggle
                variant={variant}
                defaultSelected
                icon={<StarOutlineIcon />}
                selectedIcon={<StarIcon />}
                aria-label="Selected"
              />
            </div>
          ))}
          {SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-4">
              <IconButton size={size} icon={<StarOutlineIcon />} aria-label={size} />
              <IconButton
                toggle
                size={size}
                defaultSelected
                icon={<StarOutlineIcon />}
                selectedIcon={<StarIcon />}
                aria-label="Selected"
              />
            </div>
          ))}
        </>
      }
      scoped={<IconButton variant="filled" icon={<StarOutlineIcon />} aria-label="Scoped" />}
      override={{
        token: '--md-comp-icon-button-filled-container-color',
        children: (
          <IconButton
            variant="filled"
            className="bg-tertiary"
            icon={<StarOutlineIcon />}
            aria-label="Override"
          />
        ),
      }}
    />
  ),
};
