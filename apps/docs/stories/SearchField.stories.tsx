import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, SearchBar, SearchField, matchesSearch } from '@windmorph/react';
import { useState } from 'react';
import { MicIcon, SearchIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/SearchField',
} satisfies Meta;

export default meta;
type Story = StoryObj;

const SETTINGS = [
  'Wi-Fi',
  'Bluetooth',
  'Display',
  'Sound and vibration',
  'Notifications',
  'Battery',
  'Privacy',
  'Accessibility',
];

/** A settings list filtered in place as you type. */
export const Playground: Story = {
  render: function Playground() {
    const [query, setQuery] = useState('');
    const shown = SETTINGS.filter((setting) => matchesSearch(setting, query));
    return (
      <div className="flex w-[360px] flex-col gap-2">
        <SearchField
          aria-label="Search settings"
          aria-controls="settings"
          placeholder="Search settings"
          leadingIcon={<SearchIcon />}
          value={query}
          onChange={setQuery}
        />
        <ul id="settings" aria-label="Settings" className="flex flex-col">
          {shown.map((setting) => (
            <li key={setting} className="flex h-14 items-center px-4 text-body-large">
              {setting}
            </li>
          ))}
        </ul>
        <p role="status" className="px-4 text-body-medium text-on-surface-variant">
          {shown.length === 0 ? 'No settings match' : ''}
        </p>
      </div>
    );
  },
};

/** Empty with a search icon; with text (the clear button) and a trailing icon; no icons; disabled. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4" data-testid="variants">
      <SearchField
        aria-label="Search settings"
        placeholder="Search settings"
        leadingIcon={<SearchIcon />}
        data-testid="empty"
      />
      <SearchField
        aria-label="Search settings"
        defaultValue="Display"
        leadingIcon={<SearchIcon />}
        trailingIcon={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
        data-testid="with-text"
      />
      <SearchField aria-label="Search settings" placeholder="Search settings" data-testid="plain" />
      <SearchField
        aria-label="Search settings"
        defaultValue="Display"
        leadingIcon={<SearchIcon />}
        disabled
        data-testid="disabled"
      />
    </div>
  ),
};

/** Each density, 56px at 0 to 44px at -3; the icon buttons keep 48px touch targets. */
export const Density: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4" data-testid="density">
      {([0, -1, -2, -3] as const).map((density) => (
        <SearchField
          key={density}
          aria-label={`Search settings, density ${density}`}
          defaultValue="Display"
          density={density}
          leadingIcon={<SearchIcon />}
          trailingIcon={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
          data-testid={`density-${density}`}
        />
      ))}
    </div>
  ),
};

/**
 * A hint or a query longer than a narrow field ends in an ellipsis (the query only while the
 * field isn't focused; focused, it scrolls). The search bar shares the pill, so it does too.
 */
export const LongText: Story = {
  render: () => (
    <div className="flex w-[240px] flex-col gap-4" data-testid="long">
      <SearchField
        aria-label="Search pages"
        placeholder="Search by name or page address"
        leadingIcon={<SearchIcon />}
        data-testid="hint"
      />
      <SearchField
        aria-label="Search pages"
        defaultValue="Accessibility and display settings"
        leadingIcon={<SearchIcon />}
        data-testid="query"
      />
      <SearchBar
        aria-label="Search pages"
        placeholder="Search by name or page address"
        leadingIcon={<SearchIcon />}
        view="docked"
        data-testid="bar"
      />
    </div>
  ),
};

/** Beside the search bar, so both read the same search bar tokens. */
export const BesideSearchBar: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4" data-testid="pair">
      <SearchField
        aria-label="Search settings"
        placeholder="Search"
        leadingIcon={<SearchIcon />}
        data-testid="field"
      />
      <SearchBar
        aria-label="Search"
        placeholder="Search"
        leadingIcon={<SearchIcon />}
        view="docked"
        data-testid="bar"
      />
    </div>
  ),
};

/** Layout safety (architecture §10). */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div
        className={transformedAncestor ? 'translate-x-2' : undefined}
        style={{ minHeight: 200, width: 360 }}
      >
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <SearchField
          data-testid="target"
          aria-label="Search"
          placeholder="Search"
          className={LAYOUT_OVERRIDES[override]}
          leadingIcon={<SearchIcon />}
          trailingIcon={
            <IconButton
              icon={<MicIcon />}
              aria-label="Voice search"
              onPress={() => setCount((c) => c + 1)}
            />
          }
        />
      </div>
    );
  },
};
