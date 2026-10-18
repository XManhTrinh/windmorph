import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DENSITIES,
  IconButton,
  TextField,
  type Density as DensityLevel,
  type TextFieldVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { SearchIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: TextFieldVariant[] = ['filled', 'outlined'];

const ClearIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'Label', variant: 'filled', supportingText: 'Supporting text' },
  argTypes: { variant: { control: 'inline-radio', options: VARIANTS } },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every state for both variants. */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 medium:grid-cols-2" data-testid="variants">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-6">
          <TextField variant={variant} label="Empty" supportingText="Supporting text" />
          <TextField variant={variant} label="Filled in" defaultValue="Ada Lovelace" />
          <TextField variant={variant} label="Required" required />
          <TextField
            variant={variant}
            label="Email"
            defaultValue="ada@"
            invalid
            errorMessage="Enter a complete email address"
          />
          <TextField
            variant={variant}
            label="Password"
            type="password"
            defaultValue="abc"
            invalid
            supportingText="At least 8 characters"
          />
          <TextField variant={variant} label="Disabled" defaultValue="Disabled value" disabled />
          <TextField
            variant={variant}
            label="Account number"
            defaultValue="A-1024"
            readOnly
            supportingText="Read-only"
          />
          <TextField
            variant={variant}
            label="Search"
            leadingIcon={<SearchIcon />}
            trailingIcon={<IconButton variant="standard" icon={<ClearIcon />} aria-label="Clear" />}
            defaultValue="Kyoto"
          />
          <TextField
            variant={variant}
            label="Price"
            prefix="$"
            prefixLabel="US dollars"
            suffix="USD"
            defaultValue="42"
          />
          <TextField variant={variant} aria-label="No label" placeholder="Placeholder only" />
          <TextField
            variant={variant}
            label="Bio"
            multiline
            rows={3}
            maxLength={120}
            defaultValue="Line one"
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * A text area: `multiline` keeps a fixed height of `rows` lines (4 by default) and scrolls,
 * which M3 recommends over growing fields on the web.
 */
export const TextArea: Story = {
  render: () => (
    <TextField
      label="Message"
      multiline
      data-testid="message"
      variant="outlined"
      supportingText="Tell us what happened"
    />
  ),
};

/** A multiline field with `autoGrow`: it grows to five lines, then scrolls. */
export const Multiline: Story = {
  render: () => (
    <TextField
      label="Notes"
      multiline
      autoGrow
      maxRows={5}
      data-testid="notes"
      variant="outlined"
    />
  ),
};

/** Supporting text that shows only while the field has focus. */
export const SupportingTextOnFocus: Story = {
  render: () => (
    <TextField label="Display name" supportingText="Shown on your profile" supportingTextOnFocus />
  ),
};

/** Controlled value with live validation. */
export const Validation: Story = {
  render: function ValidationStory() {
    const [value, setValue] = useState('');
    return (
      <TextField
        label="Username"
        value={value}
        onChange={setValue}
        validationBehavior="aria"
        validate={(v) => (v.length > 0 && v.length < 3 ? 'At least 3 characters' : null)}
        supportingText="Letters and numbers"
        maxLength={20}
      />
    );
  },
};

/**
 * Web density 0 to -3, one column per level: each step takes 4px off the container (56 → 44px)
 * and moves the label to match. Each field is `data-testid="<level>-<case>"`.
 */
export const Density: StoryObj<{ variant: TextFieldVariant }> = {
  args: { variant: 'filled' },
  argTypes: { variant: { control: 'inline-radio', options: VARIANTS } },
  render: ({ variant }) => (
    <div className="grid grid-cols-4 items-start gap-4" data-testid="density">
      {DENSITIES.map((density: DensityLevel) => (
        <div key={density} className="flex min-w-0 flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <TextField
            variant={variant}
            density={density}
            label="Name"
            supportingText="Supporting text"
            className="w-full"
            data-testid={`${density}-empty`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Name"
            defaultValue="Zoë Müller"
            className="w-full"
            data-testid={`${density}-value`}
          />
          <TextField
            variant={variant}
            density={density}
            aria-label="Search"
            defaultValue="Kyoto"
            className="w-full"
            data-testid={`${density}-no-label`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Search"
            leadingIcon={<SearchIcon />}
            trailingIcon={<IconButton variant="standard" icon={<ClearIcon />} aria-label="Clear" />}
            defaultValue="Kyoto"
            className="w-full"
            data-testid={`${density}-icons`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Email"
            defaultValue="sam@"
            invalid
            errorMessage="Enter a complete address"
            className="w-full"
            data-testid={`${density}-error`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Account"
            defaultValue="A-1024"
            disabled
            className="w-full"
            data-testid={`${density}-disabled`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Price"
            prefix="$"
            suffix="USD"
            defaultValue="42"
            maxLength={6}
            className="w-full"
            data-testid={`${density}-affixes`}
          />
          <TextField
            variant={variant}
            density={density}
            label="Bio"
            multiline
            rows={2}
            defaultValue="Line one"
            className="w-full"
            data-testid={`${density}-text-area`}
          />
        </div>
      ))}
    </div>
  ),
};

/** Layout safety (architecture §10) for the field root. */
export const LayoutOverride: StoryObj<{ override: LayoutOverrideName; variant: TextFieldVariant }> =
  {
    args: { override: 'none', variant: 'filled' },
    argTypes: {
      override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
      variant: { control: 'inline-radio', options: VARIANTS },
    },
    render: ({ override, variant }) => (
      <div style={{ minHeight: 200 }}>
        <TextField
          data-testid="target"
          variant={variant}
          label="Name"
          className={LAYOUT_OVERRIDES[override]}
        />
      </div>
    ),
  };
