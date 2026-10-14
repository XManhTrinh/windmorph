import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The radio button's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-radio-button',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <RadioGroup label="Delivery" defaultValue="express">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      }
      scoped={
        <RadioGroup aria-label="Scoped" defaultValue="on">
          <Radio value="on">Scoped</Radio>
        </RadioGroup>
      }
      override={{
        token: '--md-comp-radio-button-unselected-icon-color',
        children: (
          <RadioGroup aria-label="Override">
            <Radio value="off" classNames={{ ring: 'border-tertiary' }}>
              Override
            </Radio>
          </RadioGroup>
        ),
      }}
    />
  ),
};
