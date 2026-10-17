import { Switch } from '@windmorph/react';
import { CheckIcon, StarIcon, StarOutlineIcon } from '../../components/icons';

/**
 * M3's three icon configurations. With no icons the handle is plain; a `checkedIcon` alone
 * puts an icon in the handle only while on; `icons` shows the default check and close marks
 * in both states, and `checkedIcon` and `uncheckedIcon` replace them with your own.
 */
export function SwitchIcons() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultChecked checkedIcon={<CheckIcon />}>
        Icon when on
      </Switch>
      <Switch defaultChecked icons>
        Icons on and off
      </Switch>
      <Switch defaultChecked checkedIcon={<StarIcon />} uncheckedIcon={<StarOutlineIcon />}>
        Favourite
      </Switch>
    </div>
  );
}
