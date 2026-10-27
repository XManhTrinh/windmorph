import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, LabeledDivider } from '@windmorph/react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-width, start-inset and middle-inset dividers, horizontal and vertical. */
export const Dividers: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4 bg-surface" data-testid="dividers">
      <p className="px-4 text-body-medium">Full width</p>
      <Divider />
      <p className="px-4 text-body-medium">Start inset</p>
      <Divider inset="start" />
      <p className="px-4 text-body-medium">Middle inset</p>
      <Divider inset="middle" />
      <div className="flex h-16 items-center gap-4 px-4 text-body-medium">
        <span>One</span>
        <Divider orientation="vertical" />
        <span>Two</span>
        <Divider orientation="vertical" inset="middle" />
        <span>Three</span>
      </div>
      <LabeledDivider>Supporting text</LabeledDivider>
      <LabeledDivider inset="start" data-testid="labeled">
        Inset supporting text
      </LabeledDivider>
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
  render: ({ override, transformedAncestor }) => (
    <div
      className={transformedAncestor ? 'translate-x-2' : undefined}
      style={{ minHeight: 200, width: 360 }}
    >
      <Divider data-testid="target" inset="start" className={LAYOUT_OVERRIDES[override]} />
    </div>
  ),
};
