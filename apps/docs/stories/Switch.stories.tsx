import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Radio, RadioGroup, Switch } from '@windmorph/react';
import { DensityColumns } from './density-columns';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { children: 'Wi-Fi' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Off and on, with and without icons, enabled and disabled. */
export const States: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3" data-testid="states">
      {[false, true].map((disabled) => (
        <div key={String(disabled)} className="flex flex-col items-start gap-3">
          <Switch disabled={disabled}>Off</Switch>
          <Switch disabled={disabled} defaultChecked>
            On
          </Switch>
          <Switch disabled={disabled} icons>
            Off with icon
          </Switch>
          <Switch disabled={disabled} icons defaultChecked>
            On with icon
          </Switch>
        </div>
      ))}
    </div>
  ),
};

/** Layout safety (architecture §10) for the root. */
export const LayoutOverride: StoryObj<{ override: LayoutOverrideName }> = {
  args: { override: 'none' },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override }) => (
    <div style={{ minHeight: 200 }}>
      <Switch data-testid="target" className={LAYOUT_OVERRIDES[override]}>
        Layout
      </Switch>
    </div>
  ),
};

/**
 * Web density, 0 to -3: each step takes 4px off the state layer around the thumb (40 → 32px,
 * where it still rings a pressed 28px thumb); the track stays 52 × 32px and the touch target
 * 48px, as in Material Components Web's switch density.
 */
export const Density: Story = {
  render: () => (
    <DensityColumns>
      {(density) => (
        <>
          <Switch density={density} data-testid={`${density}-off`}>
            Wi-Fi
          </Switch>
          <Switch density={density} defaultChecked data-testid={`${density}-on`}>
            Bluetooth
          </Switch>
          <Switch density={density} defaultChecked icons data-testid={`${density}-icons`}>
            Airplane mode
          </Switch>
          <Switch density={density} disabled data-testid={`${density}-disabled`}>
            Hotspot
          </Switch>
        </>
      )}
    </DensityColumns>
  ),
};

/**
 * A settings row: the words at the start and the control at the end, the whole row being the
 * label (`controlPlacement="end"`), for a switch, a checkbox and a radio group.
 */
export const ControlAtTheEnd: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-2 bg-surface p-4" data-testid="control-at-the-end">
      <Switch controlPlacement="end" defaultChecked className="w-full">
        Wi-Fi
      </Switch>
      <Switch controlPlacement="end" className="w-full">
        Bluetooth
      </Switch>
      <Checkbox controlPlacement="end" defaultChecked className="w-full">
        Send me a copy
      </Checkbox>
      <RadioGroup label="Delivery" controlPlacement="end" defaultValue="standard">
        <Radio value="standard" className="w-full">
          Standard
        </Radio>
        <Radio value="express" className="w-full">
          Express
        </Radio>
      </RadioGroup>
    </div>
  ),
};
