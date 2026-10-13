import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, SearchAppBar, SearchBar } from '@windmorph/react';
import { useRef, useState } from 'react';
import { ArrowBackIcon, CloseIcon, MenuIcon, MicIcon, SearchIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  view: 'docked' | 'full-screen';
}

const meta = {
  title: 'Components/Search',
  args: { view: 'docked' },
  argTypes: { view: { control: 'inline-radio', options: ['docked', 'full-screen'] } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const SUGGESTIONS = ['Holiday photos', 'Flight confirmation', 'Invoice March', 'Team lunch'];

function Suggestions({ query, onPick }: { query: string; onPick: (value: string) => void }) {
  const items = SUGGESTIONS.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="flex flex-col py-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="flex h-14 items-center gap-4 px-4 text-start text-body-large outline-none hover:bg-on-surface/8 focus-visible:bg-on-surface/10"
        >
          <span className="size-6 text-on-surface-variant">
            <SearchIcon />
          </span>
          {item}
        </button>
      ))}
      {items.length === 0 && (
        <p className="px-4 py-4 text-body-medium text-on-surface-variant">No suggestions</p>
      )}
    </div>
  );
}

function Demo({ view, defaultExpanded = false }: Args & { defaultExpanded?: boolean }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [submitted, setSubmitted] = useState('');
  const submit = (value: string) => {
    setQuery(value);
    setSubmitted(value);
    setExpanded(false);
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <SearchBar
        data-testid="search"
        aria-label="Search mail"
        placeholder="Search mail"
        view={view}
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        expanded={expanded}
        onExpandedChange={setExpanded}
        leadingIcon={({ expanded: open, collapse }) =>
          open && view === 'full-screen' ? (
            <IconButton
              variant="standard"
              icon={<ArrowBackIcon />}
              aria-label="Back"
              onPress={collapse}
            />
          ) : (
            <SearchIcon />
          )
        }
        trailingIcon={({ expanded: open }) =>
          open && query ? (
            <IconButton
              variant="standard"
              icon={<CloseIcon />}
              aria-label="Clear"
              onPress={() => setQuery('')}
            />
          ) : (
            <IconButton variant="standard" icon={<MicIcon />} aria-label="Voice search" />
          )
        }
      >
        <Suggestions query={query} onPick={submit} />
      </SearchBar>
      <p className="text-body-medium" data-testid="submitted">
        Searched: {submitted}
      </p>
    </div>
  );
}

/** Press the bar (or type, or ↓) to expand it. */
export const Playground: Story = { render: (args) => <Demo {...args} /> };

/** Collapsed bars: with icons, text only, and with a query. */
export const Collapsed: Story = {
  render: () => (
    <div className="flex flex-col gap-4" data-testid="collapsed">
      <SearchBar
        aria-label="Search"
        placeholder="Search"
        leadingIcon={<SearchIcon />}
        trailingIcon={
          <IconButton variant="standard" icon={<MicIcon />} aria-label="Voice search" />
        }
      />
      <SearchBar aria-label="Search" placeholder="Search" />
      <SearchBar aria-label="Search" defaultValue="Holiday photos" leadingIcon={<SearchIcon />} />
    </div>
  ),
};

/** The docked view, open. */
export const DockedExpanded: Story = {
  render: () => (
    <div style={{ minHeight: 480 }}>
      <Demo view="docked" defaultExpanded />
    </div>
  ),
};

/** The full-screen view, open. */
export const FullScreenExpanded: Story = {
  render: () => <Demo view="full-screen" defaultExpanded />,
};

/** The app bar with search, over scrolling content. */
export const AppBar: StoryObj<{ scrollBehavior: 'pinned' | 'enter-always' }> = {
  args: { scrollBehavior: 'enter-always' },
  argTypes: { scrollBehavior: { control: 'inline-radio', options: ['pinned', 'enter-always'] } },
  render: function AppBarStory({ scrollBehavior }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={scrollRef}
        data-testid="scroller"
        className="h-[480px] w-[412px] overflow-y-auto rounded-corner-large border border-outline-variant"
      >
        <SearchAppBar
          data-testid="bar"
          scrollBehavior={scrollBehavior}
          scrollRef={scrollRef}
          navigationIcon={<IconButton icon={<MenuIcon />} aria-label="Menu" />}
          actions={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
        >
          <SearchBar aria-label="Search" placeholder="Search" leadingIcon={<SearchIcon />} />
        </SearchAppBar>
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="px-4 py-3 text-body-large">
            Result {index + 1}
          </p>
        ))}
      </div>
    );
  },
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
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <SearchBar
          data-testid="target"
          aria-label="Search"
          placeholder="Search"
          className={LAYOUT_OVERRIDES[override]}
          leadingIcon={<SearchIcon />}
          trailingIcon={
            <IconButton
              variant="standard"
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
