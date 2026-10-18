import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, type CardVariant } from '@windmorph/react';
import { TokenProbe } from './probe';

const VARIANTS: CardVariant[] = ['filled', 'elevated', 'outlined'];

const Body = ({ children }: { children: string }) => (
  <div className="p-4 text-title-medium">{children}</div>
);

/** Card's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-card',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={VARIANTS.map((variant) => (
        <Card key={variant} variant={variant}>
          <Body>{variant}</Body>
        </Card>
      ))}
      scoped={
        <Card variant="filled">
          <Body>Scoped</Body>
        </Card>
      }
      override={{
        token: '--md-comp-filled-card-container-color',
        children: (
          <Card variant="filled" className="bg-tertiary">
            <Body>Override</Body>
          </Card>
        ),
      }}
    />
  ),
};
