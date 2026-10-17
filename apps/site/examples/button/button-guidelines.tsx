import { Button } from '@windmorph/react';
import { StarIcon, StarOutlineIcon } from '../../components/icons';

/** Do: one filled button for the main action, the other with less emphasis. */
export function ButtonDoOneFilled() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="text">Cancel</Button>
      <Button variant="filled">Save</Button>
    </div>
  );
}

/** Don't: every action as a filled button. */
export function ButtonDontManyFilled() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="filled">Save</Button>
      <Button variant="filled">Share</Button>
      <Button variant="filled">Print</Button>
      <Button variant="filled">Archive</Button>
    </div>
  );
}

/** Do: a toggle whose label is about the same length in both states. */
export function ButtonDoToggleLabels() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button toggle variant="tonal" leadingIcon={<StarOutlineIcon />} selected={false}>
        Star
      </Button>
      <Button toggle variant="tonal" leadingIcon={<StarIcon />} selected>
        Starred
      </Button>
    </div>
  );
}

/** Don't: a toggle whose label changes length a lot between states. */
export function ButtonDontToggleLabels() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button toggle variant="tonal" leadingIcon={<StarOutlineIcon />} selected={false}>
        Star
      </Button>
      <Button toggle variant="tonal" leadingIcon={<StarIcon />} selected>
        Added to your favourites
      </Button>
    </div>
  );
}
