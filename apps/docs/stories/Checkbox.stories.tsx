import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { children: 'Label' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Unchecked, checked and indeterminate, each enabled, invalid and disabled. */
export const States: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-x-8 gap-y-2" data-testid="states">
      {(['enabled', 'invalid', 'disabled'] as const).map((kind) => (
        <div key={kind} className="flex flex-col">
          <Checkbox invalid={kind === 'invalid'} disabled={kind === 'disabled'}>
            Unchecked
          </Checkbox>
          <Checkbox defaultSelected invalid={kind === 'invalid'} disabled={kind === 'disabled'}>
            Checked
          </Checkbox>
          <Checkbox indeterminate invalid={kind === 'invalid'} disabled={kind === 'disabled'}>
            Indeterminate
          </Checkbox>
        </div>
      ))}
    </div>
  ),
};

/** A parent checkbox that is indeterminate while some children are checked. */
export const SelectAll: Story = {
  render: function SelectAllStory() {
    const items = ['Apples', 'Pears', 'Plums'];
    const [checked, setChecked] = useState<string[]>(['Pears']);
    const all = checked.length === items.length;
    return (
      <div className="flex flex-col">
        <Checkbox
          selected={all}
          indeterminate={checked.length > 0 && !all}
          onSelectedChange={(value) => setChecked(value ? items : [])}
        >
          All fruit
        </Checkbox>
        <div className="flex flex-col ps-6">
          {items.map((item) => (
            <Checkbox
              key={item}
              selected={checked.includes(item)}
              onSelectedChange={(value) =>
                setChecked((list) => (value ? [...list, item] : list.filter((i) => i !== item)))
              }
            >
              {item}
            </Checkbox>
          ))}
        </div>
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the root label. */
export const LayoutOverride: StoryObj<{ override: LayoutOverrideName }> = {
  args: { override: 'none' },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override }) => (
    <div style={{ minHeight: 200 }}>
      <Checkbox data-testid="target" className={LAYOUT_OVERRIDES[override]}>
        Layout
      </Checkbox>
    </div>
  ),
};
