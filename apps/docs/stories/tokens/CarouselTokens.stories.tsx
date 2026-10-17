import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from '@windmorph/react';
import { TokenProbe } from './probe';

const slides = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className="flex items-end bg-primary-container p-4 text-title-medium text-on-primary-container"
    >
      {index + 1}
    </div>
  ));

/** Carousel's component token, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-carousel',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="w-[360px]">
          <Carousel aria-label="Photos" className="h-[160px]">
            {slides(6)}
          </Carousel>
        </div>
      }
      scoped={
        <div className="w-[360px]">
          <Carousel aria-label="Scoped photos" className="h-[160px]">
            {slides(6)}
          </Carousel>
        </div>
      }
      override={{
        token: '--md-comp-carousel-item-container-shape',
        children: (
          <div className="w-[360px]">
            <Carousel
              aria-label="Override photos"
              className="h-[160px]"
              classNames={{ item: 'rounded-corner-small' }}
            >
              {slides(6)}
            </Carousel>
          </div>
        ),
      }}
    />
  ),
};
