import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '@windmorph/react';
import { TokenProbe } from './probe';

/** Divider's component token, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-divider',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Divider />}
      scoped={<Divider />}
      override={{
        token: '--md-comp-divider-color',
        children: <Divider className="bg-primary" />,
      }}
    />
  ),
};
