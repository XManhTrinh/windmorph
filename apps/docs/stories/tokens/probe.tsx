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
 */
export function TokenProbe({ instances, scoped, override }: TokenProbeProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div data-probe="instances" className="flex flex-col gap-4">
        {instances}
      </div>
      <ThemeScope theme="forest" mode="dark" data-probe-extra="scoped" className="bg-surface p-4">
        {scoped}
      </ThemeScope>
      <div data-probe-extra="override" data-probe-token={override.token}>
        {override.children}
      </div>
    </div>
  );
}
