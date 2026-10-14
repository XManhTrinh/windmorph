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
        <Snackbar actionLabel="Undo" onAction={noop} onDismiss={noop}>
          Message archived
        </Snackbar>
      }
      scoped={
        <Snackbar actionLabel="Undo" onAction={noop} onDismiss={noop}>
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
