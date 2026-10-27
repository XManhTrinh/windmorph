import type { Meta, StoryObj } from '@storybook/react-vite';
import { BottomSheet } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The bottom sheet's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-sheet-bottom-docked',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

const Body = ({ children }: { children: string }) => <p className="p-6">{children}</p>;

/** Open sheets are portalled; the spec finds each by the region it was rendered in. */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <BottomSheet aria-label="Modal" defaultOpen>
            <Body>Modal</Body>
          </BottomSheet>
          <BottomSheet aria-label="Standard" variant="standard">
            <Body>Standard</Body>
          </BottomSheet>
        </>
      }
      scoped={
        <BottomSheet aria-label="Scoped" defaultOpen>
          <Body>Scoped</Body>
        </BottomSheet>
      }
      override={{
        token: '--md-comp-sheet-bottom-docked-container-color',
        children: (
          <BottomSheet
            aria-label="Override"
            defaultOpen
            classNames={{ panel: 'bg-surface-container' }}
          >
            <Body>Override</Body>
          </BottomSheet>
        ),
      }}
    />
  ),
};
