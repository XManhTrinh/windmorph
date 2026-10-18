import type { Meta, StoryObj } from '@storybook/react-vite';
import { FabMenu, FabMenuItem } from '@windmorph/react';
import { AddIcon, CloseIcon, EditIcon, SendIcon } from '../icons';
import { TokenProbe } from './probe';

/** The FAB menu's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-fab-menu',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex items-end gap-6">
          {(['primary', 'secondary', 'tertiary'] as const).map((color) => (
            <FabMenu
              key={color}
              color={color}
              icon={<AddIcon />}
              openIcon={<CloseIcon />}
              aria-label={`Create ${color}`}
              defaultOpen
            >
              <FabMenuItem icon={<EditIcon />}>Edit</FabMenuItem>
              <FabMenuItem icon={<SendIcon />}>Send</FabMenuItem>
            </FabMenu>
          ))}
        </div>
      }
      scoped={
        <FabMenu icon={<AddIcon />} openIcon={<CloseIcon />} aria-label="Scoped" defaultOpen>
          <FabMenuItem icon={<EditIcon />}>Edit</FabMenuItem>
          <FabMenuItem icon={<SendIcon />}>Send</FabMenuItem>
        </FabMenu>
      }
      override={{
        token: '--md-comp-fab-menu-menu-item-container-shape',
        children: (
          <FabMenu icon={<AddIcon />} openIcon={<CloseIcon />} aria-label="Override" defaultOpen>
            <FabMenuItem icon={<EditIcon />} className="rounded-corner-small">
              Edit
            </FabMenuItem>
            <FabMenuItem icon={<SendIcon />} className="rounded-corner-small">
              Send
            </FabMenuItem>
          </FabMenu>
        ),
      }}
    />
  ),
};
