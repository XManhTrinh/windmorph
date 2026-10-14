import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistChip } from '@windmorph/react';
import { EditIcon } from '../icons';
import { TokenProbe } from './probe';

/** The assist chip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-assist-chip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-wrap gap-4">
          <AssistChip leadingIcon={<EditIcon />}>Flat</AssistChip>
          <AssistChip leadingIcon={<EditIcon />} elevated>
            Elevated
          </AssistChip>
        </div>
      }
      scoped={<AssistChip leadingIcon={<EditIcon />}>Scoped</AssistChip>}
      override={{
        token: '--md-comp-assist-chip-label-text-color',
        children: <AssistChip className="text-tertiary">Override</AssistChip>,
      }}
    />
  ),
};
