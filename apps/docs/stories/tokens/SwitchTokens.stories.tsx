import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The switch's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-switch',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <Switch icons>Off</Switch>
          <Switch icons defaultChecked>
            On
          </Switch>
        </>
      }
      scoped={<Switch defaultChecked>Scoped</Switch>}
      override={{
        token: '--md-comp-switch-unselected-handle-color',
        children: <Switch classNames={{ thumb: 'bg-tertiary' }}>Override</Switch>,
      }}
    />
  ),
};
