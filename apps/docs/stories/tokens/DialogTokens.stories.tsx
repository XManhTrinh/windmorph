import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from '@windmorph/react';
import { TokenProbe } from './probe';

const Icon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
  </svg>
);

/** An open dialog with an icon; it is portalled, and the spec finds it by its region. */
const Open = ({ title, ...props }: DialogProps & { title: string }) => (
  <Dialog defaultOpen icon={<Icon />} {...props}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>They will be removed from all devices.</DialogContent>
    <DialogActions>
      <Button variant="text">Cancel</Button>
      <Button variant="text">Delete</Button>
    </DialogActions>
  </Dialog>
);

/** Dialog's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-dialog',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Open title="Delete 3 files?" />}
      scoped={<Open title="Scoped" />}
      override={{
        token: '--md-comp-dialog-container-color',
        children: <Open title="Override" className="bg-surface-container" />,
      }}
    />
  ),
};
