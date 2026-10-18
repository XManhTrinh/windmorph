import { Button } from '@windmorph/react';
import { StarIcon } from '../../components/icons';

/**
 * Toggle buttons in the four colour styles that have one (text buttons have no toggle form).
 * Each starts unselected or selected with `defaultSelected`; press one to see it change colour
 * and shape: round buttons turn square when selected, square ones turn round.
 */
export function ButtonToggleVariants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button toggle variant="elevated" leadingIcon={<StarIcon />}>
          Elevated
        </Button>
        <Button toggle variant="filled" leadingIcon={<StarIcon />}>
          Filled
        </Button>
        <Button toggle variant="tonal" leadingIcon={<StarIcon />}>
          Tonal
        </Button>
        <Button toggle variant="outlined" leadingIcon={<StarIcon />}>
          Outlined
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button toggle defaultSelected variant="elevated" leadingIcon={<StarIcon />}>
          Elevated
        </Button>
        <Button toggle defaultSelected variant="filled" leadingIcon={<StarIcon />}>
          Filled
        </Button>
        <Button toggle defaultSelected variant="tonal" leadingIcon={<StarIcon />}>
          Tonal
        </Button>
        <Button toggle defaultSelected variant="outlined" leadingIcon={<StarIcon />}>
          Outlined
        </Button>
      </div>
    </div>
  );
}
