import { Switch } from '@windmorph/react';

/**
 * A settings row: the words at the start and the switch at the end, the whole row being the
 * label. `controlPlacement="end"` puts the switch after its label, which grows to fill the
 * row. The rows sit 16px apart, 48px top to top, so their targets never overlap. In a `List`,
 * a switch list item does the same with list semantics.
 */
export function SwitchSettingsRow() {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-4">
      <Switch controlPlacement="end" defaultChecked className="w-full">
        Wi-Fi
      </Switch>
      <Switch controlPlacement="end" className="w-full">
        Bluetooth
      </Switch>
    </div>
  );
}
