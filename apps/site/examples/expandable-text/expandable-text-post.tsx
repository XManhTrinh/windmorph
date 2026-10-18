import { Card } from '@windmorph/react';
import { Avatar, ExpandableText, Link } from '@windmorph/react-pro';

const post =
  "Phở night at the community hall this Saturday from 6pm.\nBring a bowl and a friend: every table is shared, and the broth has been simmering since Friday morning. There's a vegetarian pot too, and the kids' corner has crafts and lanterns. Parking is behind the church; the 42 bus stops outside.";

/** A feed post cut to three lines; "See more" shows only when the text is cut. */
export function ExpandableTextPost() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Card variant="outlined" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Sam Taylor" decorative />
          <span className="text-title-small text-on-surface">Sam Taylor</span>
        </div>
        <ExpandableText lines={3} className="text-body-large text-on-surface">
          {post} Sign up on the <Link href="#demo-volunteers">volunteers page</Link>.
        </ExpandableText>
      </Card>
      <Card variant="outlined" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Jordan Lee" decorative />
          <span className="text-title-small text-on-surface">Jordan Lee</span>
        </div>
        <ExpandableText lines={3} className="text-body-large text-on-surface">
          See you all there!
        </ExpandableText>
      </Card>
    </div>
  );
}
