import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fab, type FabColor, type FabSize } from '@windmorph/react';
import { AddIcon } from '../icons';
import { TokenProbe } from './probe';

const COLORS: FabColor[] = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
];
const SIZES: FabSize[] = ['default', 'md', 'lg'];

/** The FAB's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-fab',
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
              <Fab key={color} color={color} icon={<AddIcon />} aria-label={color} />
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            {SIZES.map((size) => (
              <Fab key={size} size={size} icon={<AddIcon />} aria-label={size} />
            ))}
          </div>
        </>
      }
      scoped={<Fab icon={<AddIcon />} aria-label="Scoped" />}
      override={{
        token: '--md-comp-fab-primary-container-container-color',
        children: <Fab icon={<AddIcon />} aria-label="Override" className="bg-tertiary" />,
      }}
    />
  ),
};
