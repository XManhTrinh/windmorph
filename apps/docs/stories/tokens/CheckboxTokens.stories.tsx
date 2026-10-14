import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@windmorph/react';
import { TokenProbe } from './probe';

/** Checkbox's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-checkbox',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <Checkbox>Unchecked</Checkbox>
          <Checkbox defaultSelected>Checked</Checkbox>
        </>
      }
      scoped={<Checkbox defaultSelected>Scoped</Checkbox>}
      override={{
        token: '--md-comp-checkbox-unselected-outline-color',
        children: <Checkbox classNames={{ box: 'border-tertiary' }}>Override</Checkbox>,
      }}
    />
  ),
};
