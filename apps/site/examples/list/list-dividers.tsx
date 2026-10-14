import { List, ListItem, ListItemImage } from '@windmorph/react';
import { DeleteIcon, NotificationsIcon, SettingsIcon } from '../../components/icons';

const picture = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#d9a066"/><circle cx="210" cy="90" r="42" fill="#fff8"/></svg>',
)}`;

/**
 * Standard lists with M3's dividers, `full` or `inset` (16dp from each side), and line
 * limits: headlines stop at two lines and supporting text at one, then "…". The full text
 * stays in the item's accessible name. `classNames.media` gives the images larger corners.
 */
export function ListDividers() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <List aria-label="Settings" dividers="full">
        <ListItem key="general" leading={<SettingsIcon />}>
          General
        </ListItem>
        <ListItem key="notifications" leading={<NotificationsIcon />}>
          Notifications
        </ListItem>
        <ListItem key="deleted" leading={<DeleteIcon />}>
          Recently deleted
        </ListItem>
      </List>
      <List
        aria-label="Recently deleted"
        dividers="inset"
        headlineLines={2}
        supportingTextLines={1}
        classNames={{ media: 'rounded-corner-medium' }}
      >
        <ListItem
          key="a"
          leading={<ListItemImage src={picture} alt="" />}
          supportingText="Deleted 3 days ago · 27 days left before it's gone for good"
        >
          A post with a long title that runs past two lines, so it ends with an ellipsis
        </ListItem>
        <ListItem key="b" leading={<ListItemImage alt="" fallback={<DeleteIcon />} />}>
          Words only
        </ListItem>
      </List>
    </div>
  );
}
