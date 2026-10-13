import { Divider, LabeledDivider } from '@windmorph/react';

/**
 * A divider is a 1px `outline-variant` line. Horizontal dividers span the full width;
 * `inset` leaves 16px at the start or at both ends (`middle`). A vertical divider fills
 * the height of a flex row. Mark purely visual ones `decorative` to hide them from
 * assistive tech. `LabeledDivider` adds supporting text below the line.
 */
export function DividerBasic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 bg-surface">
      <p className="px-4 text-body-medium text-on-surface">Full width</p>
      <Divider />
      <p className="px-4 text-body-medium text-on-surface">Start inset</p>
      <Divider inset="start" />
      <p className="px-4 text-body-medium text-on-surface">Middle inset</p>
      <Divider inset="middle" />
      <div className="flex h-12 items-center gap-4 px-4 text-body-medium text-on-surface">
        <span>One</span>
        <Divider orientation="vertical" />
        <span>Two</span>
        <Divider orientation="vertical" inset="middle" />
        <span>Three</span>
      </div>
      <LabeledDivider inset="start">Earlier this week</LabeledDivider>
    </div>
  );
}
