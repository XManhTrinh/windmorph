import { cookie9SidedShape } from '@windmorph/react/primitives';
import { EmptyState } from '@windmorph/react-pro';
import { SearchOffIcon } from '../../components/icons';

/**
 * A search with no results, in an M3 Expressive shape. `announce` makes it a status
 * region, so screen readers hear the result without the page reloading.
 */
export function EmptyStateSearch() {
  return (
    <EmptyState
      announce
      size="lg"
      color="tertiary"
      shape={cookie9SidedShape}
      icon={<SearchOffIcon />}
      title="No results for “pasta”"
      description="Try another word, or check the spelling."
    />
  );
}
