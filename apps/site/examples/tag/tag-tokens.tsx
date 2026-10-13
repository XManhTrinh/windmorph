import { Tag } from '@windmorph/react-pro';

/**
 * The component tokens: set `--wm-tag-*` on a tag or any ancestor. Here a section gives all
 * its tags a taller, square-cornered look without a new variant.
 */
export function TagTokens() {
  return (
    <div className="flex flex-wrap gap-2 [--wm-tag-corner:var(--md-sys-shape-corner-extra-small)] [--wm-tag-height:28px]">
      <Tag tone="primary">Full-time</Tag>
      <Tag tone="primary">On site</Tag>
      <Tag tone="secondary">£12–14 an hour</Tag>
    </div>
  );
}
