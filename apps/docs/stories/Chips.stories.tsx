import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistChip, FilterChip, InputChip, SuggestionChip } from '@windmorph/react';
import { useState } from 'react';
import { ArrowIcon, EditIcon, SearchIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Chips',
  component: AssistChip,
  args: { children: 'Add to calendar', elevated: false, disabled: false },
  argTypes: { leadingIcon: { control: false }, trailingIcon: { control: false } },
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InputChip disabled={disabled}>Input</InputChip>
            <InputChip disabled={disabled} avatar={<Avatar />} onRemove={() => {}}>
              Alice
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

/** A set of filter chips, toggling independently. */
export const Filters: Story = {
  render: function FiltersStory() {
    const [selected, setSelected] = useState<string[]>(['Spicy']);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" data-testid="filters">
          {FILTERS.map((label) => (
            <FilterChip
              key={label}
              selected={selected.includes(label)}
              onSelectedChange={(on) =>
                setSelected((all) => (on ? [...all, label] : all.filter((x) => x !== label)))
              }
            >
              {label}
            </FilterChip>
          ))}
        </div>
        <p className="text-body-medium" data-testid="selected">
          Selected: {selected.join(', ') || 'none'}
        </p>
      </div>
    );
  },
};

/** Removable input chips, e.g. recipients. */
export const Recipients: Story = {
  render: function RecipientsStory() {
    const [people, setPeople] = useState(['Alice', 'Bob', 'Carol']);
    return (
      <div className="flex flex-wrap gap-2" data-testid="recipients">
        {people.map((name) => (
          <InputChip
            key={name}
            avatar={<Avatar />}
            onRemove={() => setPeople((all) => all.filter((x) => x !== name))}
          >
            {name}
          </InputChip>
        ))}
      </div>
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
