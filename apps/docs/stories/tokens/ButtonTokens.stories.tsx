import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonSize, type ButtonVariant } from '@windmorph/react';
import { TokenProbe } from './probe';

const VARIANTS: ButtonVariant[] = ['filled', 'elevated', 'tonal', 'outlined', 'text'];
const SIZES: ButtonSize[] = ['xs', 'md', 'lg', 'xl'];

/** Button's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-button',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/*
 * Per variant: a resting button, then (except text) an unselected toggle, marked
 * `data-unselected` for the unselected tokens, and a selected one. The variants are small;
 * each other size has a resting round button and a selected round toggle, which takes the
 * square shape.
 */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap gap-4">
              <Button variant={variant}>{variant}</Button>
              {variant !== 'text' && (
                <>
                  <Button toggle variant={variant} data-unselected="">
                    Unselected
                  </Button>
                  <Button toggle variant={variant} defaultSelected>
                    Selected
                  </Button>
                </>
              )}
            </div>
          ))}
          {SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-4">
              <Button size={size}>{size}</Button>
              <Button toggle size={size} defaultSelected>
                Selected
              </Button>
            </div>
          ))}
        </>
      }
      scoped={<Button variant="filled">Scoped</Button>}
      override={{
        token: '--md-comp-button-filled-container-color',
        children: (
          <Button variant="filled" className="bg-tertiary">
            Override
          </Button>
        ),
      }}
    />
  ),
};
