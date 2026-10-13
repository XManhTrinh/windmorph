import { Tag, TagGroup } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

/**
 * Statuses on a listing: filled for the strongest ("Sold"), a dot for something live ("Open
 * now"), an icon for a quality ("Featured"). Success and warning come from the theme.
 */
export function TagStatuses() {
  return (
    <TagGroup aria-label="Listing status">
      <Tag variant="filled" tone="error">
        Sold
      </Tag>
      <Tag tone="success" dot>
        Open now
      </Tag>
      <Tag tone="warning" dot>
        Payment pending
      </Tag>
      <Tag tone="tertiary" icon={<StarIcon />}>
        Featured
      </Tag>
      <Tag>Draft</Tag>
    </TagGroup>
  );
}
