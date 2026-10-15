import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistChip, ChipSet, FilterChip, InputChip, SuggestionChip } from '@windmorph/react';
import { useState } from 'react';
import { ArrowIcon, EditIcon, SearchIcon, StarIcon } from './icons';
import { DensityColumns } from './density-columns';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Chips',
  component: AssistChip,
  args: { children: 'Add to calendar', elevated: false, disabled: false },
  argTypes: {
    leadingIcon: { control: false },
    outline: { control: 'inline-radio', options: ['standard', 'strong'] },
  },
} satisfies Meta<typeof AssistChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An assist chip; see the other stories for the chip types. */
export const Playground: Story = { args: { leadingIcon: <EditIcon /> } };

const Avatar = () => (
  <img
    alt=""
    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23b58392'/%3E%3C/svg%3E"
  />
);

/** Every chip type, flat and elevated, enabled and disabled. */
export const Types: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-4" data-testid="types">
      {[false, true].map((disabled) => (
        <div key={String(disabled)} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <AssistChip disabled={disabled} leadingIcon={<EditIcon />}>
              Assist
            </AssistChip>
            <AssistChip disabled={disabled} elevated leadingIcon={<EditIcon />}>
              Elevated assist
            </AssistChip>
            <SuggestionChip disabled={disabled}>Suggestion</SuggestionChip>
            <SuggestionChip disabled={disabled} elevated>
              Elevated suggestion
            </SuggestionChip>
            <SuggestionChip disabled={disabled} outline="strong">
              Strong outline
            </SuggestionChip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip disabled={disabled}>Filter</FilterChip>
            <FilterChip disabled={disabled} defaultSelected>
              Selected
            </FilterChip>
            <FilterChip disabled={disabled} elevated>
              Elevated
            </FilterChip>
            <FilterChip disabled={disabled} elevated defaultSelected>
              Elevated selected
            </FilterChip>
            <FilterChip disabled={disabled} leadingIcon={<StarIcon />} trailingIcon={<ArrowIcon />}>
              Icons
            </FilterChip>
            <FilterChip disabled={disabled} defaultSelected leadingIcon={<StarIcon />}>
              Selected icon
            </FilterChip>
            <FilterChip disabled={disabled} defaultSelected onRemove={() => {}}>
              Removable
            </FilterChip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InputChip disabled={disabled}>Input</InputChip>
            <InputChip disabled={disabled} avatar={<Avatar />} onRemove={() => {}}>
              Alex
            </InputChip>
            <InputChip
              disabled={disabled}
              avatar={<Avatar />}
              onPress={() => {}}
              onRemove={() => {}}
            >
              Editable
            </InputChip>
            <InputChip disabled={disabled} leadingIcon={<SearchIcon />} onRemove={() => {}}>
              Search term
            </InputChip>
            <InputChip disabled={disabled} selected onRemove={() => {}}>
              Selected
            </InputChip>
          </div>
        </div>
      ))}
    </div>
  ),
};

const FILTERS = ['Vegan', 'Gluten free', 'Spicy', 'Under 30 min'];

/** A chip set of filter chips: one Tab stop, arrow keys between chips, shared selection. */
export const Filters: Story = {
  render: function FiltersStory() {
    const [selected, setSelected] = useState<Set<string | number>>(new Set(['Spicy']));
    return (
      <div className="flex flex-col gap-4">
        <ChipSet
          aria-label="Diet"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          data-testid="filters"
        >
          {FILTERS.map((label) => (
            <FilterChip key={label} value={label}>
              {label}
            </FilterChip>
          ))}
        </ChipSet>
        <p className="text-body-medium" data-testid="selected">
          Selected: {[...selected].join(', ') || 'none'}
        </p>
      </div>
    );
  },
};

/** A single-select chip set (a radio group) that scrolls in one row. */
export const SingleSelect: Story = {
  render: () => (
    <div className="w-[280px]">
      <ChipSet
        aria-label="Sort by"
        selectionMode="single"
        defaultSelectedKeys={['relevance']}
        disallowEmptySelection
        layout="scroll"
        data-testid="single"
      >
        {['Relevance', 'Distance', 'Rating', 'Price', 'Newest'].map((label) => (
          <FilterChip key={label} value={label.toLowerCase()}>
            {label}
          </FilterChip>
        ))}
      </ChipSet>
    </div>
  ),
};

/** Removable input chips, e.g. recipients: each is one focus stop, named "Remove …". */
export const Recipients: Story = {
  render: function RecipientsStory() {
    const [people, setPeople] = useState(['Alex', 'Sam', 'Priya']);
    return (
      <ChipSet aria-label="Recipients" data-testid="recipients">
        {people.map((name) => (
          <InputChip
            key={name}
            avatar={<Avatar />}
            onRemove={() => setPeople((all) => all.filter((x) => x !== name))}
          >
            {name}
          </InputChip>
        ))}
      </ChipSet>
    );
  },
};

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
        <AssistChip
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          leadingIcon={<EditIcon />}
          onPress={() => setCount((c) => c + 1)}
        >
          Add to calendar
        </AssistChip>
      </div>
    );
  },
};

/**
 * Web density, 0 to -3: each step takes 4px off a chip (32 → 28 → 24px; -3 stays at 24px, as
 * Material Components Web's chips did) while the touch targets stay 48px. A wrapping set puts
 * 2px more between rows per step (8 → 12px), so a target never reaches the next row's chips;
 * a scrolling set adds the same above and below.
 */
export const Density: Story = {
  render: () => (
    <DensityColumns>
      {(density) => (
        <>
          <ChipSet
            aria-label="Chips"
            density={density}
            className="w-[260px]"
            data-testid={`${density}-wrap`}
          >
            <AssistChip leadingIcon={<EditIcon />}>Edit</AssistChip>
            <SuggestionChip>Sounds good</SuggestionChip>
            <FilterChip defaultSelected>Vegan</FilterChip>
            <FilterChip onRemove={() => {}}>Nearby</FilterChip>
            <InputChip avatar={<Avatar />} onRemove={() => {}}>
              Zoë
            </InputChip>
            <InputChip leadingIcon={<StarIcon />} onRemove={() => {}}>
              Saved
            </InputChip>
            <AssistChip elevated leadingIcon={<SearchIcon />}>
              Search
            </AssistChip>
          </ChipSet>
          <ChipSet
            aria-label="Filters"
            layout="scroll"
            density={density}
            className="w-[260px]"
            data-testid={`${density}-scroll`}
          >
            <FilterChip>Open now</FilterChip>
            <FilterChip defaultSelected trailingIcon={<ArrowIcon />}>
              Price
            </FilterChip>
            <FilterChip>Rating</FilterChip>
          </ChipSet>
        </>
      )}
    </DensityColumns>
  ),
};
