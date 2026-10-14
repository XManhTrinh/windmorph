import type { Meta, StoryObj } from '@storybook/react-vite';
import { FloatingToolbar, IconButton, type FloatingToolbarColor } from '@windmorph/react';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon } from '../icons';
import { TokenProbe } from './probe';

const COLORS: FloatingToolbarColor[] = ['standard', 'vibrant'];

function Sample({ color, className }: { color: FloatingToolbarColor; className?: string }) {
  return (
    <FloatingToolbar aria-label={`${color} toolbar`} color={color} className={className}>
      <IconButton icon={<FormatBoldIcon />} aria-label="Bold" />
      <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
      <IconButton icon={<FormatUnderlinedIcon />} aria-label="Underline" />
    </FloatingToolbar>
  );
}

/** The floating toolbar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-toolbar-floating',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex flex-col items-start gap-4">
          {COLORS.map((color) => (
            <Sample key={color} color={color} />
          ))}
        </div>
      }
      scoped={<Sample color="standard" />}
      override={{
        token: '--md-comp-toolbar-floating-standard-container-color',
        children: <Sample color="standard" className="bg-tertiary" />,
      }}
    />
  ),
};
