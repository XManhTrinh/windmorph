import { Checkbox } from '@windmorph/react';

/**
 * A checkbox takes its accessible name from its label `children`. Use `defaultChecked`
 * (uncontrolled) or `checked` / `onCheckedChange` (controlled) for its checked state.
 */
export function CheckboxBasic() {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox defaultChecked name="terms">
        I accept the terms
      </Checkbox>
      <Checkbox name="newsletter">Email me product updates</Checkbox>
    </div>
  );
}
