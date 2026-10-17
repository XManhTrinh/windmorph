import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, type CardVariant } from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: CardVariant[] = ['filled', 'elevated', 'outlined'];

/** Stand-in media so snapshots do not depend on image assets. */
const Media = () => (
  <div
    aria-hidden="true"
    className="h-32 bg-[linear-gradient(135deg,var(--md-sys-color-primary-container),var(--md-sys-color-tertiary-container))]"
  />
);

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { variant: 'filled' },
  argTypes: { variant: { control: 'inline-radio', options: VARIANTS } },
  render: (args) => (
    <Card {...args} className="max-w-xs">
      <Media />
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-title-medium">Kyoto</h3>
        <p className="text-body-medium text-on-surface-variant">Temples, gardens and tea houses.</p>
      </div>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Static cards with media, text and their own actions. */
export const Variants: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-4 medium:grid-cols-3" data-testid="variants">
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant}>
          <Media />
          <div className="flex flex-col gap-1 p-4">
            <h3 className="text-title-medium">{variant}</h3>
            <p className="text-body-medium text-on-surface-variant">
              Supporting text that describes the card.
            </p>
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
            <Button variant="text">Share</Button>
            <Button variant={variant === 'filled' ? 'tonal' : 'filled'}>Open</Button>
          </div>
        </Card>
      ))}
    </div>
  ),
};

/** Pressable and link cards, enabled and disabled. */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [count, setCount] = useState(0);
    return (
      <div className="flex max-w-md flex-col gap-4" data-testid="interactive">
        {VARIANTS.map((variant) => (
          <Card key={variant} variant={variant} onPress={() => setCount((c) => c + 1)}>
            <div className="p-4">
              <h3 className="text-title-medium">Pressable {variant}</h3>
              <p className="text-body-medium text-on-surface-variant">Pressed {count}</p>
            </div>
          </Card>
        ))}
        <Card variant="outlined" href="https://m3.material.io/components/cards">
          <div className="p-4">
            <h3 className="text-title-medium">Link card</h3>
          </div>
        </Card>
        {VARIANTS.map((variant) => (
          <Card key={`${variant}-disabled`} variant={variant} onPress={() => {}} disabled>
            <div className="p-4 text-title-medium">Disabled {variant}</div>
          </Card>
        ))}
      </div>
    );
  },
};

/** Cards being dragged: raised (filled and outlined to level 3, elevated to 4). */
export const Dragged: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6 p-4" data-testid="dragged">
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} dragged>
          <div className="p-4 text-title-medium">Dragged {variant}</div>
        </Card>
      ))}
      <Card variant="elevated" dragged onPress={() => {}} aria-label="Dragged pressable">
        <div className="p-4 text-title-medium">Dragged pressable</div>
      </Card>
    </div>
  ),
};

/** Layout safety (architecture §10). The card content is 96px tall. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 240 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <Card
          data-testid="target"
          className={`max-w-xs ${LAYOUT_OVERRIDES[override]}`}
          onPress={() => setCount((c) => c + 1)}
          aria-label="Trip"
        >
          <div className="h-24 p-4 text-title-medium">Trip</div>
        </Card>
      </div>
    );
  },
};
