import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, RichTooltip, RichTooltipTrigger, type RichTooltipProps } from '@windmorph/react';
import { TokenProbe } from './probe';

/** An open rich tooltip on a button; it is portalled, and the spec finds it by its region. */
const Open = ({ label, ...props }: RichTooltipProps & { label: string }) => (
  <RichTooltipTrigger persistent open placement="end">
    <Button variant="text">{label}</Button>
    <RichTooltip title="Grouped tabs" {...props} />
  </RichTooltipTrigger>
);

/** The rich tooltip's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-rich-tooltip',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Open label="Instance">Tabs from the same site stay together.</Open>}
      scoped={<Open label="Scoped">Tabs from the same site stay together.</Open>}
      override={{
        token: '--md-comp-rich-tooltip-container-color',
        children: (
          <Open label="Override" classNames={{ panel: 'bg-primary-container' }}>
            Tabs from the same site stay together.
          </Open>
        ),
      }}
    />
  ),
};
