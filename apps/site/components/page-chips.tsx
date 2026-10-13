import { Tag } from '@windmorph/react-pro';

/**
 * The "Expressive" and "Pro" tags beside a component's name, in the gallery and the side
 * navigation. Expressive is tertiary, Pro primary, so neither blends into the navigation's
 * current-page `secondary-container`. `compact` (the side navigation) shows Expressive as
 * "M3E", the short name for M3 Expressive; screen readers still hear "Expressive" and a
 * pointer shows the full name.
 */
export function PageChips({
  expressive,
  pro,
  compact = false,
}: {
  expressive?: boolean;
  pro?: boolean;
  compact?: boolean;
}) {
  if (!expressive && !pro) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {expressive ? (
        compact ? (
          <Tag size="sm" tone="tertiary" fullLabel="Expressive" title="M3 Expressive">
            M3E
          </Tag>
        ) : (
          <Tag size="sm" tone="tertiary">
            Expressive
          </Tag>
        )
      ) : null}
      {pro ? (
        <Tag
          size="sm"
          tone="primary"
          {...(compact && { title: 'Windmorph Pro, not part of Material 3' })}
        >
          Pro
        </Tag>
      ) : null}
    </span>
  );
}
