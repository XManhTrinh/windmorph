import { Card } from '@windmorph/react';

/** Stand-in media; a real card would hold an image. It clips to the 12px corners. */
function Media() {
  return (
    <div
      aria-hidden="true"
      className="h-28 bg-[linear-gradient(135deg,var(--md-sys-color-primary-container),var(--md-sys-color-tertiary-container))]"
    />
  );
}

/**
 * The three variants: `filled` (surface-container-highest), `elevated` (level 1) and
 * `outlined` (a 1px outline). All share 12px corners and clip their content. A static
 * card is a plain `<div>`, so it may hold its own buttons and links.
 */
export function CardVariants() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 medium:grid-cols-3">
      {(['filled', 'elevated', 'outlined'] as const).map((variant) => (
        <Card key={variant} variant={variant} className="w-full max-w-xs">
          <Media />
          <div className="flex flex-col gap-1 p-4">
            <h3 className="text-title-medium text-on-surface">{variant}</h3>
            <p className="text-body-medium text-on-surface-variant">
              Supporting text describing the card.
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
