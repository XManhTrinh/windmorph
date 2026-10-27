import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Dialog, DialogContent, DialogTitle, ThemeScope } from '@windmorph/react';

/**
 * The elevation shadows follow a `ThemeScope`'s shadow colour (`--md-sys-color-shadow`), in
 * place and in a portalled overlay opened inside the scope. Probed by e2e/dialog.spec.ts.
 */
const meta = {
  title: 'Tokens/md-sys-elevation',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const ScopedShadow: StoryObj = {
  render: () => (
    <div className="flex gap-6 p-4">
      <Card variant="elevated" data-testid="default-card">
        <p className="p-4 text-title-medium">Default shadow</p>
      </Card>
      {/* Important, to win over the theme's own `--md-sys-color-shadow` on the scope. */}
      <ThemeScope className="[--md-sys-color-shadow:rgb(255_0_0)]!">
        <Card variant="elevated" data-testid="scoped-card">
          <p className="p-4 text-title-medium">Scoped shadow</p>
        </Card>
        <Dialog defaultOpen role="dialog" aria-label="Scoped dialog">
          <DialogTitle>Scoped dialog</DialogTitle>
          <DialogContent>Its shadow takes the scope's colour.</DialogContent>
        </Dialog>
      </ThemeScope>
    </div>
  ),
};
