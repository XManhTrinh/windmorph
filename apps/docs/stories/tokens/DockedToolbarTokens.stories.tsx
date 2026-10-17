import type { Meta, StoryObj } from '@storybook/react-vite';
import { DockedToolbar, IconButton } from '@windmorph/react';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon } from '../icons';
import { TokenProbe } from './probe';

const Buttons = () => (
  <>
    <IconButton icon={<FormatBoldIcon />} aria-label="Bold" />
    <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
    <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" />
  </>
);

/** The docked toolbar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-toolbar-docked',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-col gap-4">
          <DockedToolbar aria-label="Docked">
            <Buttons />
          </DockedToolbar>
          <DockedToolbar aria-label="Docked vibrant" color="vibrant">
            <Buttons />
          </DockedToolbar>
        </div>
      }
      scoped={
        <DockedToolbar aria-label="Scoped">
          <Buttons />
        </DockedToolbar>
      }
      override={{
        token: '--md-comp-toolbar-docked-container-color',
        children: (
          <DockedToolbar aria-label="Override" className="bg-tertiary">
            <Buttons />
          </DockedToolbar>
        ),
      }}
    />
  ),
};
