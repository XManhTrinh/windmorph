import { List, ListItem, ListItemImage, ListItemVideo } from '@windmorph/react';
import { MenuBookIcon } from '../../components/icons';

/** A flat colour picture with a sun, standing in for a photo. */
const picture = (colour: string, width = 300, height = 300) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${colour}"/><circle cx="${width * 0.7}" cy="${height * 0.3}" r="${height * 0.14}" fill="#fff8"/></svg>`,
  )}`;

/**
 * M3's leading media: `ListItemImage` (56dp square) and `ListItemVideo` (a 100dp-wide
 * thumbnail with its length). With no `src`, or when the image fails to load, the
 * `fallback` icon shows on a tonal square. `alt=""` when the headline already says it.
 */
export function ListMedia() {
  return (
    <div className="w-full max-w-sm rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Saved" variant="segmented">
        <ListItem
          key="soup"
          leading={<ListItemImage src={picture('#d9a066')} alt="" />}
          supportingText="Saved yesterday"
        >
          Tomato soup
        </ListItem>
        <ListItem
          key="notes"
          leading={<ListItemImage alt="" fallback={<MenuBookIcon />} />}
          supportingText="No photo"
        >
          Reading notes
        </ListItem>
        <ListItem
          key="video"
          leading={<ListItemVideo src={picture('#7aa6c2', 400, 225)} alt="" duration="2:41" />}
          supportingText="Cooking · 12k views"
        >
          How to make pancakes
        </ListItem>
      </List>
    </div>
  );
}
