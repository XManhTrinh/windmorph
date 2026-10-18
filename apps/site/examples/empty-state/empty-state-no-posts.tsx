import { Button } from '@windmorph/react';
import { EmptyState } from '@windmorph/react-pro';
import { DynamicFeedIcon } from '../../components/icons';

/**
 * A feed with nothing in it yet, in a filled card like the posts it stands in for. Visitors
 * get a line about what will appear; the owner also gets the next step.
 */
export function EmptyStateNoPosts() {
  return (
    <div className="grid w-full gap-4 medium:grid-cols-2">
      <EmptyState
        variant="filled"
        icon={<DynamicFeedIcon />}
        title="No posts yet"
        description="When Sam posts, you'll see it here."
      />
      <EmptyState
        variant="filled"
        icon={<DynamicFeedIcon />}
        title="No posts yet"
        description="Posts you share will appear here."
        actions={<Button variant="tonal">Create a post</Button>}
      />
    </div>
  );
}
