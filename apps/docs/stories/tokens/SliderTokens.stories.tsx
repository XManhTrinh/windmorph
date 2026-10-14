import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '@windmorph/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { TokenProbe } from './probe';

/** The slider's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-slider',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/**
 * Focuses the slider inside it once, so the value indicator shows (it appears while the
 * thumb is focused or dragged). Focus without a pointer counts as keyboard focus.
 */
function Focused({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.querySelector('input')?.focus(), []);
  return <div ref={ref}>{children}</div>;
}

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <Focused>
          <Slider aria-label="Volume" defaultValue={40} showValueLabel className="w-80" />
        </Focused>
      }
      scoped={<Slider aria-label="Scoped" defaultValue={40} className="w-80" />}
      override={{
        token: '--md-comp-slider-handle-color',
        children: (
          <Slider
            aria-label="Override"
            defaultValue={40}
            className="w-80"
            classNames={{ thumb: '*:bg-tertiary' }}
          />
        ),
      }}
    />
  ),
};
