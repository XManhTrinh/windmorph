import { ThemeScope } from '@windmorph/react';
import type { ReactNode } from 'react';

export interface TokenProbeProps {
  /**
   * One instance per scope value (each variant and size), and per state a token needs (a
   * selected instance for `selected-*` tokens). Put a resting instance of each scope value
   * before its state instances: the spec uses the first match.
   */
  instances: ReactNode;
  /** An instance inside a forest, dark ThemeScope, for the role-value check. */
  scoped: ReactNode;
  /** An instance whose `className` overrides what `token` paints, so the class must win. */
  override: { token: string; children: ReactNode };
}

/**
 * The layout every `Tokens/<set name>` probe story renders, read by
 * `e2e/component-tokens.spec.ts`: `data-probe="instances"`, then the scoped and override
 * instances, which the per-token checks skip.
 *
 * Each region is a `ThemeScope` with a `token-probe-<region>` class. An overlay opened in it
 * (a dialog, sheet or tooltip, rendered open) is portalled to `body`, and `Overlay` puts the
 * scope's class and theme on its wrapper, so the spec finds the overlay's region by that
 * class, as it would any element inside the region.
 */
export function TokenProbe({ instances, scoped, override }: TokenProbeProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <ThemeScope data-probe="instances" className="token-probe-instances flex flex-col gap-4">
        {instances}
      </ThemeScope>
      <ThemeScope
        theme="forest"
        mode="dark"
        data-probe-extra="scoped"
        className="token-probe-scoped bg-surface p-4"
      >
        {scoped}
      </ThemeScope>
      <ThemeScope
        data-probe-extra="override"
        data-probe-token={override.token}
        className="token-probe-override"
      >
        {override.children}
      </ThemeScope>
    </div>
  );
}
