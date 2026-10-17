import { Tag } from '@windmorph/react-pro';

/**
 * Short forms in a tight space, like this site's navigation: screen readers hear the full
 * name, and a tooltip shows it on hover, keyboard focus or a long press. A long label
 * truncates at `maxWidth` and shows its full text the same way.
 */
export function TagShortForms() {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-body-large text-on-surface">
        Button group
        <Tag size="sm" color="tertiary" fullLabel="Expressive">
          M3E
        </Tag>
        <Tag size="sm" color="primary" fullLabel="Pro: Windmorph Pro, not part of Material 3">
          Pro
        </Tag>
      </p>
      <Tag variant="outlined" shape="square" maxWidth="12rem">
        Fresh herbs, spices and imported groceries
      </Tag>
    </div>
  );
}
