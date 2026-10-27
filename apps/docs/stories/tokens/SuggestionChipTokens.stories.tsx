import type { Meta, StoryObj } from '@storybook/react-vite';
import { SuggestionChip } from '@windmorph/react';
import { StarIcon } from '../icons';
import { TokenProbe } from './probe';

/** The suggestion chip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-suggestion-chip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-wrap gap-4">
          <SuggestionChip leadingIcon={<StarIcon />}>Flat</SuggestionChip>
          <SuggestionChip leadingIcon={<StarIcon />} elevated>
            Elevated
          </SuggestionChip>
        </div>
      }
      scoped={<SuggestionChip leadingIcon={<StarIcon />}>Scoped</SuggestionChip>}
      override={{
        token: '--md-comp-suggestion-chip-flat-outline-color',
        children: <SuggestionChip className="border-primary">Override</SuggestionChip>,
      }}
    />
  ),
};
