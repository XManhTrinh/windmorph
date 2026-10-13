import { Switch } from '@windmorph/react';

/** Disabled switches keep their on / off position at reduced opacity. */
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
