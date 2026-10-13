import { Switch } from '@windmorph/react';
import { CheckIcon, StarIcon, StarOutlineIcon } from '../../components/icons';

/**
 * M3's three icon configurations. With no icons the handle is plain; a `selectedIcon` alone
 * puts an icon in the handle only while on; `icons` shows the default check and close marks
 * in both states, and `selectedIcon` and `unselectedIcon` replace them with your own.
 */
export function SwitchIcons() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultSelected selectedIcon={<CheckIcon />}>
        Icon when on
      </Switch>
      <Switch defaultSelected icons>
        Icons on and off
      </Switch>
      <Switch defaultSelected selectedIcon={<StarIcon />} unselectedIcon={<StarOutlineIcon />}>
        Favourite
      </Switch>
    </div>
  );
}
