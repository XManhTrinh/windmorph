import { IconButton, TopAppBar } from '@windmorph/react';
import { ArrowBackIcon, MoreVertIcon, SearchIcon, StarIcon } from '../../components/icons';

const back = <IconButton icon={<ArrowBackIcon />} aria-label="Back" />;
const actions = (
  <>
    <IconButton icon={<StarIcon />} aria-label="Favourite" />
    <IconButton icon={<MoreVertIcon />} aria-label="More" />
  </>
);

/**
 * The three sizes in a bounded 412px frame. `small` is a single 64px row; `medium` and
 * `large` add a second title row that collapses into the top row as the page scrolls. A
 * title can carry a `subtitle` and be centred with `titleAlign`. Wrap the title in a
 * heading element when it names the page.
 */
export function TopAppBarVariants() {
  return (
    <div className="flex w-[412px] max-w-full flex-col gap-4">
      <TopAppBar title="Small" navigationIcon={back} actions={actions} />
      <TopAppBar
        title="Centred"
        titleAlign="center"
        actions={<IconButton icon={<SearchIcon />} aria-label="Search" />}
      />
      <TopAppBar
        variant="medium"
        title="Medium"
        subtitle="24 messages"
        navigationIcon={back}
        actions={actions}
      />
      <TopAppBar variant="large" title="Large" navigationIcon={back} actions={actions} />
    </div>
  );
}
