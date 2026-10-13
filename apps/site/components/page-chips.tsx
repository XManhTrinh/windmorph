import { Tag } from '@windmorph/react-pro';

/**
 * The "Expressive" and "Pro" tags beside a component's name, in the gallery, the page header
 * and the side navigation. Expressive is tertiary, Pro primary, so neither blends into the
 * navigation's current-page `secondary-container`. One label everywhere: "Expressive" for an
 * M3 Expressive component, "Pro" for a Windmorph Pro one.
 */
export function PageChips({ expressive, pro }: { expressive?: boolean; pro?: boolean }) {
  if (!expressive && !pro) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {expressive ? (
        <Tag size="sm" tone="tertiary" title="M3 Expressive">
          Expressive
        </Tag>
      ) : null}
      {pro ? (
        <Tag size="sm" tone="primary" title="Windmorph Pro, not part of Material 3">
          Pro
        </Tag>
      ) : null}
    </span>
  );
}
