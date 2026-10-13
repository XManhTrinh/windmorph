import { Tag } from '@windmorph/react-pro';

/**
 * Short forms in a tight space, like this site's navigation: screen readers hear the full
 * name, and a pointer shows it. A long label truncates at `maxWidth`.
 */
export function TagShortForms() {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-body-large text-on-surface">
        Button group
        <Tag size="sm" tone="tertiary" fullLabel="Expressive">
          M3E
        </Tag>
        <Tag size="sm" tone="primary" fullLabel="Pro: Windmorph Pro, not part of Material 3">
          Pro
        </Tag>
      </p>
      <Tag variant="outlined" shape="rounded" maxWidth="12rem">
        Fresh herbs, spices and imported groceries
      </Tag>
    </div>
  );
}
