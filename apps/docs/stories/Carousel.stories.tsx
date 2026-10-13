import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from '@windmorph/react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = { title: 'Components/Carousel' } satisfies Meta;

export default meta;
type Story = StoryObj;

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];

/** Coloured panels stand in for images. */
const slides = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      data-testid={`slide-${index}`}
      className={`flex items-end p-4 text-title-medium ${TONES[index % TONES.length]}`}
    >
      {index + 1}
    </div>
  ));

/** Multi-browse: large, medium and small items. Scroll, drag or use the arrow keys. */
export const MultiBrowse: Story = {
  render: () => (
    <div className="w-[360px]" data-testid="frame">
      <Carousel aria-label="Photos" className="h-[221px]" data-testid="carousel">
        {slides(10)}
      </Carousel>
    </div>
  ),
};

/** Uncontained: fixed-size items, the last one cut off; no snapping. */
export const Uncontained: Story = {
  render: () => (
    <div className="w-[412px]" data-testid="frame">
      <Carousel
        aria-label="Cards"
        variant="uncontained"
        itemSize={180}
        className="h-[221px]"
        data-testid="carousel"
      >
        {slides(8)}
      </Carousel>
    </div>
  ),
};

/** Hero, centred: one large item between small ones. */
export const Hero: Story = {
  render: () => (
    <div className="w-[412px]" data-testid="frame">
      <Carousel
        aria-label="Featured"
        variant="hero"
        heroAlignment="center"
        className="h-[221px]"
        data-testid="carousel"
      >
        {slides(6)}
      </Carousel>
    </div>
  ),
};

/** Vertical multi-browse. */
export const Vertical: Story = {
  render: () => (
    <div className="h-[480px] w-[240px]" data-testid="frame">
      <Carousel
        aria-label="Photos"
        orientation="vertical"
        preferredItemSize={240}
        className="h-full"
        data-testid="carousel"
      >
        {slides(8)}
      </Carousel>
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
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 240 }}>
      <Carousel
        aria-label="Photos"
        data-testid="target"
        style={{ width: 360, height: 200 }}
        className={LAYOUT_OVERRIDES[override]}
      >
        {slides(6)}
      </Carousel>
    </div>
  ),
};
