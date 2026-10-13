import { List, ListItem, ListItemAvatar } from '@windmorph/react';
import { HomeIcon, StarIcon } from '../../components/icons';

/**
 * A plain, non-interactive list (a `ul`): one-, two- and three-line items with leading
 * and trailing content. With no `onAction`, selection or links it renders as a static
 * `ul` that nothing focuses. The `segmented` variant separates items into rounded groups.
 */
export function ListStatic() {
  return (
    <div className="w-full max-w-sm rounded-corner-extra-large bg-surface-container p-3">
      <List aria-label="Contacts" variant="segmented">
        <ListItem key="one" leading={<HomeIcon />} trailing={<StarIcon />}>
          One line
        </ListItem>
        <ListItem
          key="two"
          leading={<ListItemAvatar>B</ListItemAvatar>}
          supportingText="Supporting text"
          trailing="9:41"
        >
          Two lines
        </ListItem>
        <ListItem
          key="three"
          leading={<ListItemAvatar>C</ListItemAvatar>}
          overline="Overline"
          supportingText="Supporting text"
        >
          Three lines
        </ListItem>
      </List>
    </div>
  );
}
