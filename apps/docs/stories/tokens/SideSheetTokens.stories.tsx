import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideSheet } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The side sheet's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-sheet-side',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

/**
 * The docked modal sheet comes before the detached one, so it is the first modal root. Modal
 * sheets are portalled; the spec finds each by the region it was rendered in.
 */
export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <SideSheet title="Modal" defaultOpen>
            Modal
          </SideSheet>
          <SideSheet title="Detached" detached defaultOpen>
            Detached
          </SideSheet>
          <div className="flex h-[240px]">
            <SideSheet title="Standard" variant="standard">
              Standard
            </SideSheet>
          </div>
        </>
      }
      scoped={
        <SideSheet title="Scoped" defaultOpen>
          Scoped
        </SideSheet>
      }
      override={{
        token: '--md-comp-sheet-side-docked-modal-container-color',
        children: (
          <SideSheet title="Override" defaultOpen className="bg-surface-container">
            Override
          </SideSheet>
        ),
      }}
    />
  ),
};
