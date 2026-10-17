import { Switch } from '@windmorph/react';

/** Disabled switches keep their on / off position in muted colours and can't be focused. */
export function SwitchStates() {
  return (
    <div className="flex flex-col gap-3">
      <Switch defaultSelected disabled>
        Disabled, on
      </Switch>
      <Switch disabled>Disabled, off</Switch>
    </div>
  );
}
