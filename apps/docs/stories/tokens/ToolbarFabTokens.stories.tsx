import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolbarFab, type FloatingToolbarColor } from '@windmorph/react';
import { AddIcon } from '../icons';
import { TokenProbe } from './probe';

const COLORS: FloatingToolbarColor[] = ['standard', 'vibrant'];

function Sample({ color, className }: { color: FloatingToolbarColor; className?: string }) {
  return (
    <span className="inline-flex size-[56px]">
      <ToolbarFab
        icon={<AddIcon />}
        aria-label={`New ${color}`}
        color={color}
        className={className}
      />
    </span>
  );
}

/** The toolbar FAB's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-toolbar-floating-fab',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <div className="flex items-start gap-4">
          {COLORS.map((color) => (
            <Sample key={color} color={color} />
          ))}
        </div>
      }
      scoped={<Sample color="standard" />}
      override={{
        token: '--md-comp-toolbar-floating-fab-standard-container-color',
        children: <Sample color="standard" className="bg-tertiary" />,
      }}
    />
  ),
};
