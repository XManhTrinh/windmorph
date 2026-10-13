import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingIndicator, type LoadingIndicatorVariant } from '@windmorph/react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: LoadingIndicatorVariant[] = ['default', 'contained'];
const VALUES = [0, 0.25, 0.5, 0.75, 1];

const meta = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
  args: { 'aria-label': 'Loading', variant: 'default' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    shapes: { control: false },
  },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Indeterminate until a `value` is set. */
export const Playground: Story = {};

/** Both variants, indeterminate. */
export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-fit items-center gap-6" data-testid="indeterminate">
      {VARIANTS.map((variant) => (
        <LoadingIndicator key={variant} variant={variant} aria-label={`Loading ${variant}`} />
      ))}
    </div>
  ),
};

/** Determinate progress: the circle morphs into a soft burst and turns back half a turn. */
export const Determinate: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-4" data-testid="determinate">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-24 text-label-medium text-on-surface-variant">{variant}</span>
          {VALUES.map((value) => (
            <LoadingIndicator
              key={value}
              variant={variant}
              value={value}
              aria-label={`${variant} ${value * 100}%`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** The box is 48px; `className` resizes it and the shape scales with it. */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-fit items-center gap-6" data-testid="sizes">
      {['size-6', 'size-12', 'size-24', 'size-40'].map((size) => (
        <LoadingIndicator
          key={size}
          variant="contained"
          value={0.6}
          className={size}
          aria-label={size}
        />
      ))}
    </div>
  ),
};

/** Any sequence of two or more Material shapes. */
export const CustomShapes: Story = {
  args: { shapes: ['Heart', 'Flower', 'Clover4Leaf', 'Burst'], 'aria-label': 'Loading' },
};

export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
      <LoadingIndicator
        data-testid="target"
        variant="contained"
        className={LAYOUT_OVERRIDES[override]}
        aria-label="Loading"
      />
    </div>
  ),
};
