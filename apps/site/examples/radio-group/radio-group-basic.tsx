import { Radio, RadioGroup } from '@windmorph/react';

/**
 * `RadioGroup` holds the selection, the group label and arrow-key navigation; each `Radio`
 * takes a `value` and a label. A `Radio` must be rendered inside a `RadioGroup`.
 */
export function RadioGroupBasic() {
  return (
    <RadioGroup label="Delivery" defaultValue="standard" name="delivery">
      <Radio value="standard">Standard (3–5 days)</Radio>
      <Radio value="express">Express (1–2 days)</Radio>
      <Radio value="pickup">Collect in store</Radio>
    </RadioGroup>
  );
}
