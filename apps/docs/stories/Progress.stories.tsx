import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, CircularProgressIndicator, LinearProgressIndicator } from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  value: number;
  wavy: boolean;
  thickness: number;
  track: boolean;
}

const meta = {
  title: 'Components/Progress',
  args: { value: 0.4, wavy: false, thickness: 4, track: true },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    thickness: { control: { type: 'range', min: 2, max: 16, step: 1 } },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  render: ({ value, wavy, thickness, track }) => {
    const shared = { wavy, thickness, track };
    return (
      <div className="flex w-[360px] flex-col gap-8">
        <LinearProgressIndicator value={value} {...shared} aria-label="Linear" className="w-full" />
        <LinearProgressIndicator {...shared} aria-label="Indeterminate" className="w-full" />
        <div className="flex gap-8">
          <CircularProgressIndicator value={value} {...shared} aria-label="Circular" />
          <CircularProgressIndicator {...shared} aria-label="Indeterminate circular" />
        </div>
      </div>
    );
  },
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

/** Indeterminate indicators, linear and circular, flat and wavy. */
export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-6" data-testid="indeterminate">
      <LinearProgressIndicator aria-label="Loading" />
      <LinearProgressIndicator wavy aria-label="Loading wavy" />
      <div className="flex items-center gap-6">
        <CircularProgressIndicator aria-label="Loading circular" />
        <CircularProgressIndicator wavy aria-label="Loading circular wavy" />
      </div>
    </div>
  ),
};

/** The spec's thick configuration (8px strokes), and a track thicker than the indicator. */
export const Thickness: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-6" data-testid="thickness">
      <LinearProgressIndicator value={0.6} thickness={8} aria-label="Thick" />
      <LinearProgressIndicator value={0.6} wavy thickness={8} aria-label="Thick wavy" />
      <LinearProgressIndicator value={0.6} trackThickness={8} aria-label="Thick track" />
      <div className="flex items-center gap-6">
        <CircularProgressIndicator value={0.6} thickness={8} aria-label="Thick circular" />
        <CircularProgressIndicator value={0.6} wavy thickness={8} aria-label="Thick wavy circle" />
        <CircularProgressIndicator thickness={8} aria-label="Thick indeterminate" />
      </div>
    </div>
  ),
};

/** Turning determinate: a button switches the indicators from indeterminate to 70%. */
export const Handoff: Story = {
  render: function Render() {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <div className="flex w-[280px] flex-col gap-6">
        <LinearProgressIndicator value={value} aria-label="Handoff linear" />
        <CircularProgressIndicator value={value} aria-label="Handoff circular" />
        <Button onPress={() => setValue(value === undefined ? 0.7 : undefined)}>Toggle</Button>
      </div>
    );
  },
};

/** A value change: the indicators ease to the new value instead of jumping. */
export const ValueChange: Story = {
  render: function Render() {
    const [value, setValue] = useState(0.2);
    return (
      <div className="flex w-[280px] flex-col gap-6">
        <LinearProgressIndicator value={value} aria-label="Changing linear" />
        <CircularProgressIndicator value={value} aria-label="Changing circular" />
        <Button onPress={() => setValue(value === 0.2 ? 0.8 : 0.2)}>Change</Button>
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
