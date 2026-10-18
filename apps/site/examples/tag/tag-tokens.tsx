import { Tag } from '@windmorph/react-pro';

/**
 * The component tokens: set `--wm-tag-*` on a tag or any ancestor. Here a section gives all
 * its tags a taller look with small (extra-small) corners, without a new variant.
 */
export function TagTokens() {
  return (
    <div className="flex flex-wrap gap-2 [--wm-tag-corner:var(--md-sys-shape-corner-extra-small)] [--wm-tag-height:28px]">
      <Tag color="primary">Full-time</Tag>
      <Tag color="primary">On site</Tag>
      <Tag color="secondary">£12–14 an hour</Tag>
    </div>
  );
}
