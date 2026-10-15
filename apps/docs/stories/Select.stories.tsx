import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DENSITIES,
  Select,
  SelectItem,
  SelectSection,
  type Density as DensityLevel,
  type SelectKey,
  type TextFieldVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { SearchIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Select',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const sortOptions = [
  <SelectItem key="newest">Newest first</SelectItem>,
  <SelectItem key="low" description="Cheapest at the top">
    Price, low to high
  </SelectItem>,
  <SelectItem key="high">Price, high to low</SelectItem>,
  <SelectItem key="near">Nearest to you</SelectItem>,
];

/**
 * Both variants: empty, a placeholder (shown once the label floats), chosen, a leading icon,
 * invalid (with the error icon), disabled and read-only.
 */
export const Variants: Story = {
  render: () => (
    <div className="grid gap-6 bg-surface p-4 medium:grid-cols-2" data-testid="variants">
      {(['filled', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-6">
          <Select variant={variant} label="Sort by" supportingText="How results are ordered">
            {sortOptions}
          </Select>
          <Select variant={variant} label="Sort by" placeholder="Choose an order">
            {sortOptions}
          </Select>
          <Select variant={variant} label="Sort by" defaultValue="low" leadingIcon={<SearchIcon />}>
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            label="Sort by"
            required
            invalid
            errorMessage="Choose how to sort"
          >
            {sortOptions}
          </Select>
          <Select variant={variant} label="Sort by" defaultValue="newest" disabled>
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            label="Sort by"
            defaultValue="near"
            readOnly
            supportingText="Read-only"
          >
            {sortOptions}
          </Select>
        </div>
      ))}
    </div>
  ),
};

/** The menu open under the field, with the chosen option checked. */
export const Open: Story = {
  render: () => (
    <div className="bg-surface p-4" style={{ minHeight: 360 }} data-testid="open">
      <Select label="Sort by" defaultValue="low" defaultOpen disabledKeys={['near']}>
        {sortOptions}
      </Select>
    </div>
  ),
};

/**
 * Web density 0 to -3, one column per level: the field loses 4px per step (56 → 44px). Each
 * field is `data-testid="<level>-<case>"`.
 */
export const Density: StoryObj<{ variant: TextFieldVariant }> = {
  args: { variant: 'filled' },
  argTypes: { variant: { control: 'inline-radio', options: ['filled', 'outlined'] } },
  render: ({ variant }) => (
    <div className="grid grid-cols-4 items-start gap-4 bg-surface p-4" data-testid="density">
      {DENSITIES.map((density: DensityLevel) => (
        <div key={density} className="flex min-w-0 flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Select
            variant={variant}
            density={density}
            label="Sort by"
            className="w-full"
            data-testid={`${density}-empty`}
          >
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            density={density}
            label="Sort by"
            defaultValue="low"
            leadingIcon={<SearchIcon />}
            className="w-full"
            data-testid={`${density}-value`}
          >
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            density={density}
            aria-label="Sort order"
            defaultValue="newest"
            className="w-full"
            data-testid={`${density}-no-label`}
          >
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            density={density}
            label="Sort by"
            invalid
            errorMessage="Choose how to sort"
            className="w-full"
            data-testid={`${density}-error`}
          >
            {sortOptions}
          </Select>
          <Select
            variant={variant}
            density={density}
            label="Sort by"
            defaultValue="near"
            disabled
            className="w-full"
            data-testid={`${density}-disabled`}
          >
            {sortOptions}
          </Select>
        </div>
      ))}
    </div>
  ),
};

/** An open menu at a density: options lose 4px per step (44 → 32px). */
export const DensityOpen: StoryObj<{ density: DensityLevel }> = {
  args: { density: -2 },
  argTypes: { density: { control: 'inline-radio', options: [...DENSITIES] } },
  render: ({ density }) => (
    <div className="bg-surface p-4" style={{ minHeight: 420 }} data-testid="open">
      <Select label="Sort by" density={density} defaultValue="low" defaultOpen>
        <SelectSection title="Order">
          <SelectItem key="newest">Newest first</SelectItem>
          <SelectItem key="low" description="Cheapest at the top">
            Price, low to high
          </SelectItem>
        </SelectSection>
        <SelectSection title="Place">
          <SelectItem key="near">Nearest to you</SelectItem>
          <SelectItem key="far">Furthest away</SelectItem>
        </SelectSection>
      </Select>
    </div>
  ),
};

/** Sections with headings, and options with icons. */
export const Sections: Story = {
  render: () => (
    <div className="bg-surface p-4" style={{ minHeight: 420 }} data-testid="sections">
      <Select label="Category" defaultOpen>
        <SelectSection title="Food">
          <SelectItem key="pho" leadingIcon={<StarIcon />}>
            Noodles and soup
          </SelectItem>
          <SelectItem key="banh-mi">Sandwiches</SelectItem>
        </SelectSection>
        <SelectSection title="Services">
          <SelectItem key="nails" trailing="128">
            Nails and beauty
          </SelectItem>
          <SelectItem key="tax" trailing="42">
            Tax and accounting
          </SelectItem>
        </SelectSection>
      </Select>
    </div>
  ),
};

/** Multiple selection: the field lists the chosen options, the menu stays open. */
export const Multiple: Story = {
  render: function Render() {
    const [value, setValue] = useState<SelectKey[]>(['pho', 'banh-mi', 'cafe']);
    return (
      <div className="flex flex-col gap-4 bg-surface p-4" data-testid="multiple">
        <Select
          label="Cuisines"
          selectionMode="multiple"
          value={value}
          onChange={setValue}
          maxSelections={4}
          supportingText="Up to four"
        >
          <SelectItem key="pho">Noodle soup</SelectItem>
          <SelectItem key="banh-mi">Sandwiches</SelectItem>
          <SelectItem key="cafe">Coffee</SelectItem>
          <SelectItem key="bun">Grilled noodles</SelectItem>
          <SelectItem key="com">Rice plates</SelectItem>
          <SelectItem key="che">Dessert</SelectItem>
        </Select>
        <p className="text-body-medium text-on-surface-variant">
          Value: <output data-testid="value">{value.join(', ') || '(none)'}</output>
        </p>
      </div>
    );
  },
};

/** `presentation="sheet"`: the options in a bottom sheet (or `"auto"`: on phones only). */
export const Sheet: Story = {
  render: () => (
    <div className="bg-surface p-4" data-testid="sheet">
      <Select label="Sort by" presentation="auto" defaultValue="newest">
        {sortOptions}
      </Select>
    </div>
  ),
};

const COUNTRIES = [
  ['AU', 'Australia'],
  ['AT', 'Austria'],
  ['BE', 'Belgium'],
  ['CA', 'Canada'],
  ['CZ', 'Czechia'],
  ['DK', 'Denmark'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['DE', 'Germany'],
  ['IE', 'Ireland'],
  ['IT', 'Italy'],
  ['JP', 'Japan'],
  ['NL', 'Netherlands'],
  ['NZ', 'New Zealand'],
  ['NO', 'Norway'],
  ['PL', 'Poland'],
  ['SG', 'Singapore'],
  ['KR', 'South Korea'],
  ['ES', 'Spain'],
  ['SE', 'Sweden'],
  ['TW', 'Taiwan'],
  ['TH', 'Thailand'],
  ['GB', 'United Kingdom'],
  ['US', 'United States'],
].map(([code, name]) => ({ code: code!, name: name! }));

/**
 * `searchable`: a search at the top of the menu (or, with `presentation="auto"`, the sheet
 * on phones) filters a long list as you type.
 */
export const Searchable: Story = {
  render: function Render() {
    const [country, setCountry] = useState<SelectKey | null>(null);
    return (
      <div
        className="flex flex-col gap-4 bg-surface p-4"
        style={{ minHeight: 560 }}
        data-testid="searchable"
      >
        <Select
          label="Country of residence"
          searchable
          presentation="auto"
          items={COUNTRIES}
          value={country}
          onChange={setCountry}
        >
          {(item) => <SelectItem key={item.code}>{item.name}</SelectItem>}
        </Select>
        <p className="text-body-medium text-on-surface-variant">
          Value: <output data-testid="value">{country ?? '(none)'}</output>
        </p>
      </div>
    );
  },
};

/** Labels the app passes in. */
export const CustomLabels: Story = {
  render: () => (
    <div className="bg-surface p-4" data-testid="custom-labels">
      <Select
        label="Sort by"
        placeholder="Choose an order"
        labels={{ empty: 'Nothing to choose', loading: 'Loading', more: (count) => `+${count}` }}
      >
        <SelectItem key="newest">Newest first</SelectItem>
        <SelectItem key="low">Price, low to high</SelectItem>
        <SelectItem key="high">Price, high to low</SelectItem>
      </Select>
    </div>
  ),
};

/** Controlled, inside a form, with the value it reports. */
export const Interactive: Story = {
  render: function Render() {
    const [sort, setSort] = useState<SelectKey | null>('newest');
    return (
      <form className="flex flex-col gap-4 bg-surface p-4" data-testid="interactive">
        <Select label="Sort by" name="sort" value={sort} onChange={setSort}>
          {sortOptions}
        </Select>
        <p className="text-body-medium text-on-surface-variant">
          Value: <output data-testid="value">{sort ?? '(none)'}</output>
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
      style={{ minHeight: 320, width: 360 }}
    >
      <Select data-testid="target" label="Sort by" className={LAYOUT_OVERRIDES[override]}>
        {sortOptions}
      </Select>
    </div>
  ),
};
