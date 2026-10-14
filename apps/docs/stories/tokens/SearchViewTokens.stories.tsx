import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBar } from '@windmorph/react';
import { SearchIcon } from '../icons';
import { TokenProbe } from './probe';

/** A search bar with its docked view open over a few suggestions. */
function Sample({ label, contentClassName }: { label: string; contentClassName?: string }) {
  return (
    <SearchBar
      aria-label={label}
      placeholder={label}
      view="docked"
      defaultExpanded
      leadingIcon={<SearchIcon />}
      {...(contentClassName && { classNames: { content: contentClassName } })}
    >
      <ul className="py-2">
        {['Holiday photos', 'Flight confirmation'].map((item) => (
          <li key={item} className="flex h-14 items-center px-4 text-body-large">
            {item}
          </li>
        ))}
      </ul>
    </SearchBar>
  );
}

/** The search view's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-search-view',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Sample label="Search mail" />}
      scoped={<Sample label="Scoped" />}
      override={{
        token: '--md-comp-search-view-container-color',
        children: <Sample label="Override" contentClassName="bg-tertiary" />,
      }}
    />
  ),
};
