import { Switch } from '@windmorph/react';

/**
 * A switch toggles a single setting on or off. It takes its accessible name from its label
 * `children`; use `defaultChecked` (uncontrolled) or `checked` / `onCheckedChange`.
 */
export function SwitchBasic() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultChecked>Wi-Fi</Switch>
      <Switch>Bluetooth</Switch>
    </div>
  );
}
