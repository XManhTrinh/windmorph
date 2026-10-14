import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExtendedFab, type ExtendedFabSize, type FabColor } from '@windmorph/react';
import { EditIcon } from '../icons';
import { TokenProbe } from './probe';

const COLORS: FabColor[] = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
];
const SIZES: ExtendedFabSize[] = ['sm', 'md', 'lg'];

/** The extended FAB's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-extended-fab',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => (
              <ExtendedFab key={color} color={color} icon={<EditIcon />}>
                {color}
              </ExtendedFab>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            {SIZES.map((size) => (
              <ExtendedFab key={size} size={size} icon={<EditIcon />}>
                {size}
              </ExtendedFab>
            ))}
          </div>
        </>
      }
      scoped={<ExtendedFab icon={<EditIcon />}>Scoped</ExtendedFab>}
      override={{
        token: '--md-comp-extended-fab-small-container-shape',
        children: (
          <ExtendedFab icon={<EditIcon />} className="rounded-corner-small">
            Override
          </ExtendedFab>
        ),
      }}
    />
  ),
};
