import { EmptyState } from '@windmorph/react-pro';
import { SearchOffIcon } from '../../components/icons';

const VARIANTS = ['plain', 'filled', 'elevated', 'outlined'] as const;

/**
 * The four containers: `plain` sits on whatever is behind it, `filled` and `elevated` are
 * cards, and `outlined` draws a border. `size` (`sm`, `md`, `lg`) scales the icon and text
 * to the space it fills.
 */
export function EmptyStateVariants() {
  return (
    <div className="grid w-full gap-4 medium:grid-cols-2">
      {VARIANTS.map((variant, index) => (
        <EmptyState
          key={variant}
          variant={variant}
          size={index % 2 === 0 ? 'sm' : 'md'}
          icon={<SearchOffIcon />}
          title={`No saved searches (${variant})`}
          description="Searches you save will appear here."
        />
      ))}
    </div>
  );
}
