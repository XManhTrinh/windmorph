import { Badge, BadgedBox, IconButton } from '@windmorph/react';
import { HomeIcon, SendIcon, StarIcon } from '../../components/icons';

/**
 * A `Badge` with no children is the small 6px dot; with children it is the large badge
 * holding a short count or label. `BadgedBox` places a badge at the top end of its anchor.
 * Name the anchor so the badge's meaning is read, e.g. "Messages, 12 unread".
 */
export function BadgeBasic() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <Badge />
        <Badge>3</Badge>
        <Badge>999+</Badge>
        <Badge>New</Badge>
      </div>
      <div className="flex items-center gap-8 text-on-surface-variant">
        <BadgedBox badge={<Badge />}>
          <span className="size-6">
            <StarIcon />
          </span>
        </BadgedBox>
        <BadgedBox badge={<Badge>3</Badge>}>
          <span className="size-6">
            <HomeIcon />
          </span>
        </BadgedBox>
        <IconButton
          aria-label="Messages, 12 unread"
          icon={
            <BadgedBox badge={<Badge>12</Badge>}>
              <SendIcon />
            </BadgedBox>
          }
        />
      </div>
    </div>
  );
}
