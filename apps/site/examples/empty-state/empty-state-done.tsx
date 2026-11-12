import { EmptyState } from '@windmorph/react-pro';
import { CheckCircleIcon } from '../../components/icons';

/** The end of a feed: nothing left to read, so the mark takes the theme's success colour. */
export function EmptyStateDone() {
  return (
    <div className="w-full max-w-sm rounded-corner-medium border border-outline-variant">
      <EmptyState
        size="sm"
        color="success"
        icon={<CheckCircleIcon />}
        title="You're all caught up"
        description="New posts will appear here."
      />
    </div>
  );
}
