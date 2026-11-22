import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeScope } from '@windmorph/react';

/**
 * The `dark:` variant follows the nearest part with a mode: the page, or a ThemeScope inside it,
 * nested up to three deep, `system` read from the device. Each marker shows "Light" or "Dark"
 * by `dark:` alone. Probed by e2e/dark-variant.spec.ts.
 */
const meta = {
  title: 'Tokens/dark variant',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

function Marker({ id }: { id: string }) {
  return (
    <p data-testid={id} className="text-body-medium text-on-surface">
      {id}: <span className="dark:hidden">Light</span>
      <span className="hidden dark:inline">Dark</span>
    </p>
  );
}

export const NestedScopes: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2 p-4">
      <Marker id="page" />
      <ThemeScope mode="light" className="bg-surface p-2">
        <Marker id="light-in-page" />
        <ThemeScope mode="dark" className="bg-surface p-2">
          <Marker id="dark-in-light" />
          <ThemeScope mode="light" className="bg-surface p-2">
            <Marker id="light-in-dark-in-light" />
          </ThemeScope>
        </ThemeScope>
      </ThemeScope>
      <ThemeScope mode="dark" className="bg-surface p-2">
        <Marker id="dark-in-page" />
      </ThemeScope>
      <ThemeScope mode="system" className="bg-surface p-2">
        <Marker id="system-in-page" />
      </ThemeScope>
    </div>
  ),
};
