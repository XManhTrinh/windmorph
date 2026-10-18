import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingIndicator } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The loading indicator's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-loading-indicator',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex gap-4">
          <LoadingIndicator value={0.5} aria-label="Default" />
          <LoadingIndicator value={0.5} variant="contained" aria-label="Contained" />
        </div>
      }
      scoped={<LoadingIndicator value={0.5} variant="contained" aria-label="Scoped" />}
      override={{
        token: '--md-comp-loading-indicator-contained-container-color',
        children: (
          <LoadingIndicator
            value={0.5}
            variant="contained"
            className="bg-tertiary-container"
            aria-label="Override"
          />
        ),
      }}
    />
  ),
};
