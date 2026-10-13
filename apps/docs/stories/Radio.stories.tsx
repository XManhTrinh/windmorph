import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from '@windmorph/react';
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
