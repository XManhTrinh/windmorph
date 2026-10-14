import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputChip } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The input chip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-input-chip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

const remove = () => {};

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-wrap gap-4">
          <InputChip onRemove={remove}>Alex</InputChip>
          <InputChip selected onRemove={remove}>
            Sam
          </InputChip>
        </div>
      }
      scoped={<InputChip onRemove={remove}>Scoped</InputChip>}
      override={{
        token: '--md-comp-input-chip-container-shape',
        children: (
          <InputChip onRemove={remove} className="rounded-corner-medium">
            Priya
          </InputChip>
        ),
      }}
    />
  ),
};
