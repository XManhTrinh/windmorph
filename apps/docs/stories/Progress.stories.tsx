import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircularProgressIndicator, LinearProgressIndicator } from '@windmorph/react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  value: number;
  wavy: boolean;
}

const meta = {
  title: 'Components/Progress',
  args: { value: 0.4, wavy: false },
  argTypes: { value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  render: ({ value, wavy }) => (
    <div className="flex w-[360px] flex-col gap-8">
      <LinearProgressIndicator value={value} wavy={wavy} aria-label="Linear" className="w-full" />
      <LinearProgressIndicator wavy={wavy} aria-label="Indeterminate" className="w-full" />
      <CircularProgressIndicator value={value} wavy={wavy} aria-label="Circular" />
    </div>
  ),
};

const VALUES = [0, 0.05, 0.3, 0.6, 1];

/** Determinate linear indicators, flat and wavy, across their range. */
export const Linear: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-4" data-testid="linear">
      {[false, true].map((wavy) =>
        VALUES.map((value) => (
          <LinearProgressIndicator
            key={`${wavy}-${value}`}
            value={value}
            wavy={wavy}
            aria-label={`${wavy ? 'Wavy' : 'Flat'} ${value * 100}%`}
          />
        )),
      )}
    </div>
  ),
};

/** Determinate circular indicators, flat and wavy. */
export const Circular: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-4" data-testid="circular">
      {[false, true].map((wavy) => (
        <div key={String(wavy)} className="flex items-center gap-4">
          {VALUES.map((value) => (
            <CircularProgressIndicator
              key={value}
              value={value}
              wavy={wavy}
              aria-label={`${wavy ? 'Wavy' : 'Flat'} ${value * 100}%`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Indeterminate linear indicators, flat and wavy. */
export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-6" data-testid="indeterminate">
      <LinearProgressIndicator aria-label="Loading" />
      <LinearProgressIndicator wavy aria-label="Loading wavy" />
    </div>
  ),
};

export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
      <LinearProgressIndicator
        data-testid="target"
        value={0.5}
        aria-label="Progress"
        className={LAYOUT_OVERRIDES[override]}
      />
    </div>
  ),
};
