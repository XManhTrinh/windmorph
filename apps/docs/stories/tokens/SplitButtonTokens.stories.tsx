import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, MenuItem, SplitButton, type SplitButtonSize } from '@windmorph/react';
import { TokenProbe } from './probe';

const SIZES: SplitButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const menu = (
  <Menu>
    <MenuItem key="later">Send later</MenuItem>
  </Menu>
);

/** The split button's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-split-button',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={SIZES.map((size) => (
        <div key={size}>
          <SplitButton size={size} menuLabel="More send options" menu={menu}>
            {size}
          </SplitButton>
        </div>
      ))}
      scoped={
        <SplitButton menuLabel="More send options" menu={menu}>
          Scoped
        </SplitButton>
      }
      override={{
        token: '--md-comp-split-button-small-container-shape',
        children: (
          <SplitButton
            menuLabel="More send options"
            menu={menu}
            classNames={{ leading: 'rounded-s-corner-small' }}
          >
            Override
          </SplitButton>
        ),
      }}
    />
  ),
};
