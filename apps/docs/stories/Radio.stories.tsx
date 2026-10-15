import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from '@windmorph/react';
import { DensityColumns } from './density-columns';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Radio',
  component: RadioGroup,
  args: { label: 'Delivery', defaultValue: 'standard' },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="standard">Standard</Radio>
      <Radio value="express">Express</Radio>
      <Radio value="pickup">Pickup</Radio>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Enabled, disabled option, disabled group, horizontal and invalid. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6" data-testid="states">
      <RadioGroup label="Enabled" defaultValue="b" supportingText="Pick one">
        <Radio value="a">Option A</Radio>
        <Radio value="b">Option B</Radio>
        <Radio value="c" disabled>
          Option C (disabled)
        </Radio>
      </RadioGroup>
      <RadioGroup label="Disabled group" defaultValue="a" disabled>
        <Radio value="a">Option A</Radio>
        <Radio value="b">Option B</Radio>
      </RadioGroup>
      <RadioGroup label="Horizontal" orientation="horizontal" invalid errorMessage="Choose a size">
        <Radio value="s">Small</Radio>
        <Radio value="m">Medium</Radio>
        <Radio value="l">Large</Radio>
      </RadioGroup>
    </div>
  ),
};

/** Layout safety (architecture §10) for a radio root. */
export const LayoutOverride: StoryObj<{ override: LayoutOverrideName }> = {
  args: { override: 'none' },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override }) => (
    <div style={{ minHeight: 200 }}>
      <RadioGroup aria-label="Layout">
        <Radio value="x" data-testid="target" className={LAYOUT_OVERRIDES[override]}>
          Layout
        </Radio>
      </RadioGroup>
    </div>
  ),
};

/**
 * Web density, 0 to -3: each step takes 4px off the round state layer (40 → 28px) and puts 2px
 * more between rows, so each option's 48px touch target never reaches the next one's ring.
 */
export const Density: Story = {
  render: () => (
    <DensityColumns>
      {(density) => (
        <>
          <RadioGroup
            label="Delivery"
            density={density}
            defaultValue="standard"
            data-testid={`${density}-vertical`}
          >
            <Radio value="standard">Standard</Radio>
            <Radio value="express">Express</Radio>
            <Radio value="pickup">Pick up</Radio>
            <Radio value="locker" disabled>
              Locker
            </Radio>
          </RadioGroup>
          <RadioGroup
            label="Size"
            orientation="horizontal"
            density={density}
            defaultValue="m"
            data-testid={`${density}-horizontal`}
          >
            <Radio value="s">S</Radio>
            <Radio value="m">M</Radio>
            <Radio value="l">L</Radio>
          </RadioGroup>
        </>
      )}
    </DensityColumns>
  ),
};
