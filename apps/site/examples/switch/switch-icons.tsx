import { Switch } from '@windmorph/react';
import { StarIcon, StarOutlineIcon } from '../../components/icons';

/**
 * `icons` shows the default check / close marks in the thumb; `selectedIcon` and
 * `unselectedIcon` override them with your own.
 */
export function SwitchIcons() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultSelected icons>
        Show icons
      </Switch>
      <Switch defaultSelected selectedIcon={<StarIcon />} unselectedIcon={<StarOutlineIcon />}>
        Favourite
      </Switch>
    </div>
  );
}
