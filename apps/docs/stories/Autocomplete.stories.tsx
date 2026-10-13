import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  matchesSearch,
  type AutocompleteKey,
} from '@windmorph/react';
import { useEffect, useState } from 'react';
import { SearchIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Autocomplete',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface City {
  id: string;
  name: string;
  country: string;
}

const CITIES: City[] = [
  { id: 'zrh', name: 'Zürich', country: 'Switzerland' },
  { id: 'sp', name: 'São Paulo', country: 'Brazil' },
  { id: 'mlg', name: 'Málaga', country: 'Spain' },
  { id: 'ldn', name: 'London', country: 'United Kingdom' },
  { id: 'bham', name: 'Birmingham', country: 'United Kingdom' },
  { id: 'syd', name: 'Sydney', country: 'Australia' },
  { id: 'mel', name: 'Melbourne', country: 'Australia' },
  { id: 'hou', name: 'Houston', country: 'United States' },
  { id: 'sj', name: 'San Jose', country: 'United States' },
];

const renderCity = (city: City) => (
  <AutocompleteItem key={city.id} description={city.country}>
    {city.name}
  </AutocompleteItem>
);

/** Both variants: empty, chosen, a leading icon, invalid and disabled. */
export const Variants: Story = {
  render: () => (
    <div className="grid gap-6 bg-surface p-4 medium:grid-cols-2" data-testid="variants">
      {(['filled', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-6">
          <Autocomplete
            variant={variant}
            label="City"
            defaultItems={CITIES}
            supportingText="Where you live"
          >
            {renderCity}
          </Autocomplete>
          <Autocomplete
            variant={variant}
            label="City"
            defaultItems={CITIES}
            defaultValue="ldn"
            leadingIcon={<SearchIcon />}
          >
            {renderCity}
          </Autocomplete>
          <Autocomplete
            variant={variant}
            label="City"
            defaultItems={CITIES}
            required
            invalid
            errorMessage="Choose a city"
          >
            {renderCity}
          </Autocomplete>
          <Autocomplete
            variant={variant}
            label="City"
            defaultItems={CITIES}
            defaultValue="zrh"
            disabled
          >
            {renderCity}
          </Autocomplete>
        </div>
      ))}
    </div>
  ),
};

/** Grouped by country, with sections. */
export const Sections: Story = {
  render: () => {
    const countries = [...new Set(CITIES.map((city) => city.country))];
    return (
      <div className="bg-surface p-4" style={{ minHeight: 480 }} data-testid="sections">
        <Autocomplete label="City">
          {countries.map((country) => (
            <AutocompleteSection key={country} title={country}>
              {CITIES.filter((city) => city.country === country).map((city) => (
                <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>
              ))}
            </AutocompleteSection>
          ))}
        </Autocomplete>
      </div>
    );
  },
};

/** Multiple selection as input chips; Backspace in the empty input removes the last one. */
export const Multiple: Story = {
  render: function Render() {
    const [value, setValue] = useState<AutocompleteKey[]>(['zrh', 'ldn']);
    return (
      <div className="flex flex-col gap-4 bg-surface p-4" data-testid="multiple">
        <Autocomplete
          label="Cities you'd move to"
          selectionMode="multiple"
          defaultItems={CITIES}
          value={value}
          onChange={setValue}
          maxSelections={3}
          supportingText="Up to three"
        >
          {renderCity}
        </Autocomplete>
        <p className="text-body-medium text-on-surface-variant">
          Value: <output data-testid="value">{value.join(', ') || '(none)'}</output>
        </p>
      </div>
    );
  },
};

/** Options loaded for what was typed, with the loading indicator meanwhile. */
export const Async: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      if (!query) return;
      const timer = setTimeout(() => {
        setItems(CITIES.filter((city) => matchesSearch(city.name, query)));
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [query]);
    return (
      <div className="bg-surface p-4" style={{ minHeight: 360 }} data-testid="async">
        <Autocomplete
          label="City"
          items={items}
          inputValue={query}
          onInputChange={(next) => {
            setQuery(next);
            setLoading(next !== '');
            if (!next) setItems([]);
          }}
          loading={loading}
        >
          {renderCity}
        </Autocomplete>
      </div>
    );
  },
};

/** Free text with `allowsCustomValue`, and labels the app passes in. */
export const CustomLabels: Story = {
  render: () => (
    <div className="bg-surface p-4" data-testid="custom-labels">
      <Autocomplete
        label="City"
        defaultItems={CITIES}
        allowsCustomValue
        labels={{
          noResults: 'Nothing found',
          loading: 'Loading',
          showOptions: 'Show options',
          remove: 'Remove',
        }}
      >
        {renderCity}
      </Autocomplete>
    </div>
  ),
};

/** Controlled, inside a form, with the value it reports. */
export const Interactive: Story = {
  render: function Render() {
    const [city, setCity] = useState<AutocompleteKey | null>(null);
    return (
      <form className="flex flex-col gap-4 bg-surface p-4" data-testid="interactive">
        <Autocomplete
          label="City"
          name="city"
          defaultItems={CITIES}
          value={city}
          onChange={setCity}
          clearable
          disabledKeys={['mlg']}
        >
          {renderCity}
        </Autocomplete>
        <p className="text-body-medium text-on-surface-variant">
          Value: <output data-testid="value">{city ?? '(none)'}</output>
        </p>
      </form>
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
  render: ({ override, transformedAncestor }) => (
    <div
      className={transformedAncestor ? 'translate-x-2' : undefined}
      style={{ minHeight: 360, width: 360 }}
    >
      <Autocomplete
        data-testid="target"
        label="City"
        defaultItems={CITIES}
        className={LAYOUT_OVERRIDES[override]}
      >
        {renderCity}
      </Autocomplete>
    </div>
  ),
};
