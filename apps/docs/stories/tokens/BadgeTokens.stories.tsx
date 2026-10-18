import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@windmorph/react';
import { TokenProbe } from './probe';

/** Badge's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-badge',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex items-center gap-4">
          <Badge />
          <Badge>{3}</Badge>
        </div>
      }
      scoped={<Badge>{3}</Badge>}
      override={{
        token: '--md-comp-badge-large-color',
        children: <Badge className="bg-primary">{3}</Badge>,
      }}
    />
  ),
};
