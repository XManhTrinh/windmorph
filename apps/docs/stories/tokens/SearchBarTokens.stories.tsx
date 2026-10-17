import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, SearchBar } from '@windmorph/react';
import { MicIcon, SearchIcon } from '../icons';
import { TokenProbe } from './probe';

function Sample({ label, fieldClassName }: { label: string; fieldClassName?: string }) {
  return (
    <SearchBar
      aria-label={label}
      placeholder={label}
      defaultValue="Holiday photos"
      leadingIcon={<SearchIcon />}
      trailingIcon={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
      {...(fieldClassName && { classNames: { field: fieldClassName } })}
    />
  );
}

/** The search bar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-search-bar',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Sample label="Search mail" />}
      scoped={<Sample label="Scoped" />}
      override={{
        token: '--md-comp-search-bar-container-color',
        children: <Sample label="Override" fieldClassName="bg-tertiary" />,
      }}
    />
  ),
};
