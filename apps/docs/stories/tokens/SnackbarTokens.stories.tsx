import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from '@windmorph/react';
import { TokenProbe } from './probe';

const noop = () => {};

/** Snackbar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-snackbar',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <Snackbar actionLabel="Undo" onAction={noop} onClose={noop}>
          Message archived
        </Snackbar>
      }
      scoped={
        <Snackbar actionLabel="Undo" onAction={noop} onClose={noop}>
          Scoped
        </Snackbar>
      }
      override={{
        token: '--md-comp-snackbar-container-color',
        children: (
          <Snackbar actionLabel="Undo" onAction={noop} className="bg-surface-container">
            Override
          </Snackbar>
        ),
      }}
    />
  ),
};
