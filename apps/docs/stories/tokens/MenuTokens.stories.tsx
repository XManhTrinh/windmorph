import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, Menu, MenuGroup, MenuItem, MenuTrigger } from '@windmorph/react';
import { ArrowIcon, EditIcon, MoreVertIcon, SendIcon } from '../icons';
import { TokenProbe } from './probe';

/** An open menu whose second item is selected, so the first shows the resting colours. */
function Sample({ label, className }: { label: string; className?: string }) {
  return (
    <MenuTrigger defaultOpen>
      <IconButton icon={<MoreVertIcon />} aria-label={label} />
      <Menu
        aria-label={label}
        selectionMode="single"
        defaultSelectedKeys={['send']}
        placement="end-top"
        classNames={{ panel: className }}
      >
        <MenuGroup aria-label="Actions">
          <MenuItem key="edit" leadingIcon={<EditIcon />} trailingIcon={<ArrowIcon />}>
            Edit
          </MenuItem>
          <MenuItem key="send" leadingIcon={<SendIcon />}>
            Send
          </MenuItem>
        </MenuGroup>
      </Menu>
    </MenuTrigger>
  );
}

/** The menu's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-menus',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/** Three menus open at once: the instance, the scoped one and the override. */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Sample label="Instance" />}
      scoped={<Sample label="Scoped" />}
      override={{
        token: '--md-comp-menus-standard-container-color',
        children: <Sample label="Override" className="bg-tertiary" />,
      }}
    />
  ),
};
