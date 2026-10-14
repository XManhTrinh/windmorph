import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip, TooltipTrigger, type TooltipProps } from '@windmorph/react';
import { TokenProbe } from './probe';

/** An open plain tooltip on a button; it is portalled, and the spec finds it by its region. */
const Open = ({ label, ...props }: TooltipProps & { label: string }) => (
  <TooltipTrigger isOpen placement="end">
    <Button variant="text">{label}</Button>
    <Tooltip {...props} />
  </TooltipTrigger>
);

/** The plain tooltip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-plain-tooltip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Open label="Instance">Add to favourites</Open>}
      scoped={<Open label="Scoped">Add to favourites</Open>}
      override={{
        token: '--md-comp-plain-tooltip-container-color',
        children: (
          <Open label="Override" className="bg-primary">
            Add to favourites
          </Open>
        ),
      }}
    />
  ),
};
