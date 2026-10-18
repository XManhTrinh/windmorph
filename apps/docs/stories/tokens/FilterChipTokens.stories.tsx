import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChip } from '@windmorph/react';
import { SearchIcon } from '../icons';
import { TokenProbe } from './probe';

/** The filter chip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-filter-chip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-wrap gap-4">
          <FilterChip leadingIcon={<SearchIcon />}>Flat</FilterChip>
          <FilterChip defaultSelected>Selected</FilterChip>
          <FilterChip elevated>Elevated</FilterChip>
        </div>
      }
      scoped={<FilterChip>Scoped</FilterChip>}
      override={{
        token: '--md-comp-filter-chip-flat-selected-container-color',
        children: (
          <FilterChip defaultSelected className="data-selected:bg-tertiary-container">
            Override
          </FilterChip>
        ),
      }}
    />
  ),
};
