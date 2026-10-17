import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeSlider, Slider, type SliderSize } from '@windmorph/react';
import { useState } from 'react';
import { VolumeDownIcon, VolumeUpIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const SIZES: SliderSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

interface Args {
  size: SliderSize;
  valueLabel: boolean;
  /** Discrete, in steps of 10 with a stop indicator at each. */
  ticks: boolean;
}

const meta = {
  title: 'Components/Slider',
  args: { size: 'xs', valueLabel: true, ticks: false },
  argTypes: { size: { control: 'inline-radio', options: SIZES } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  render: ({ size, valueLabel, ticks }) => {
    function Demo() {
      const [value, setValue] = useState(40);
      return (
        <div className="flex w-[360px] flex-col gap-4 pt-16">
          <Slider
            aria-label="Volume"
            data-testid="slider"
            size={size}
            value={value}
            onChange={setValue}
            valueLabel={valueLabel}
            {...(ticks && { step: 10, ticks: true })}
          />
          <p className="text-body-medium" data-testid="value">
            Value {value}
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * Every size, with inset icons from medium up. At a low value the start icon moves to the
 * inactive track.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-6" data-testid="sizes">
      {SIZES.map((size) => (
        <Slider
          key={size}
          aria-label={`Volume ${size}`}
          size={size}
          defaultValue={40}
          leadingIcon={size === 'xs' || size === 'sm' ? undefined : <VolumeDownIcon />}
          trailingIcon={size === 'xs' || size === 'sm' ? undefined : <VolumeUpIcon />}
        />
      ))}
      <Slider
        aria-label="Volume low"
        size="md"
        defaultValue={3}
        leadingIcon={<VolumeDownIcon />}
        trailingIcon={<VolumeUpIcon />}
        data-testid="moved-icon"
      />
    </div>
  ),
};

/** Discrete, centred, range and disabled sliders. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-6" data-testid="variants">
      <Slider aria-label="Discrete" step={10} ticks defaultValue={30} />
      <Slider aria-label="Centred" centered min={-50} max={50} defaultValue={20} />
      <Slider
        aria-label="Centred discrete"
        centered
        ticks
        step={10}
        min={-50}
        max={50}
        defaultValue={-20}
      />
      <RangeSlider aria-label="Range" defaultValue={[20, 70]} />
      <RangeSlider aria-label="Range discrete" step={10} ticks defaultValue={[20, 70]} />
      <Slider aria-label="Disabled" disabled defaultValue={40} />
      <RangeSlider aria-label="Disabled range" disabled defaultValue={[20, 70]} />
    </div>
  ),
};

/** Vertical sliders run bottom to top. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-[260px] items-start gap-8" data-testid="vertical">
      <Slider
        aria-label="Vertical xs"
        orientation="vertical"
        defaultValue={60}
        data-testid="vertical-slider"
      />
      <Slider
        aria-label="Vertical md"
        orientation="vertical"
        size="md"
        defaultValue={30}
        leadingIcon={<VolumeDownIcon />}
      />
      <Slider
        aria-label="Vertical discrete"
        orientation="vertical"
        step={20}
        ticks
        defaultValue={40}
      />
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
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div
        className={transformedAncestor ? 'translate-x-2' : undefined}
        style={{ minHeight: 200, width: 360 }}
      >
        <p className="mb-4 text-body-medium" data-testid="count">
          Changed {count}
        </p>
        <Slider
          aria-label="Volume"
          data-testid="target"
          style={{ width: 320 }}
          className={LAYOUT_OVERRIDES[override]}
          defaultValue={50}
          onChangeEnd={() => setCount((c) => c + 1)}
        />
      </div>
    );
  },
};
