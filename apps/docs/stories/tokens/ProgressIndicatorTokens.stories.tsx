import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircularProgressIndicator, LinearProgressIndicator } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The progress indicators' component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-progress-indicator',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <LinearProgressIndicator value={0.5} aria-label="Linear" />
          <CircularProgressIndicator value={0.5} aria-label="Circular" />
        </>
      }
      scoped={<LinearProgressIndicator value={0.5} aria-label="Scoped" />}
      override={{
        token: '--md-comp-progress-indicator-active-indicator-color',
        children: (
          <LinearProgressIndicator
            value={0.5}
            aria-label="Override"
            classNames={{ indicator: 'stroke-tertiary' }}
          />
        ),
      }}
    />
  ),
};
