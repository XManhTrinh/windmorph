import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Menu,
  MenuItem,
  SplitButton,
  type SplitButtonSize,
  type SplitButtonVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { EditIcon, SendIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: SplitButtonVariant[] = ['filled', 'tonal', 'outlined', 'elevated'];
const SIZES: SplitButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const sendMenu = (onAction?: (key: string) => void) => (
  <Menu onAction={(key) => onAction?.(String(key))}>
    <MenuItem key="later">Send later</MenuItem>
    <MenuItem key="draft">Save draft</MenuItem>
    <MenuItem key="discard">Discard</MenuItem>
  </Menu>
);

const meta = {
  title: 'Components/SplitButton',
  component: SplitButton,
  args: {
    children: 'Send',
    menuLabel: 'More send options',
    variant: 'filled',
    size: 'sm',
    disabled: false,
    leadingIcon: <SendIcon />,
    menu: sendMenu(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    leadingIcon: { control: false },
    menu: { control: false },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
        <SplitButton
          {...args}
          data-testid="split"
          onPress={() => setLast('send')}
          menu={sendMenu(setLast)}
        />
      </div>
    );
  },
};

/** Every style at every size. */
export const VariantsAndSizes: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-6" data-testid="variants">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-20 text-label-medium text-on-surface-variant">{variant}</span>
          {SIZES.map((size) => (
            <SplitButton
              key={size}
              variant={variant}
              size={size}
              leadingIcon={<EditIcon />}
              menuLabel={`${variant} ${size} options`}
              menu={sendMenu()}
            >
              Edit
            </SplitButton>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** The leading button with only an icon, named by `leadingLabel`. */
export const IconOnly: Story = {
  render: () => (
    <div className="flex w-fit items-center gap-6" data-testid="icon-only">
      {SIZES.map((size) => (
        <SplitButton
          key={size}
          size={size}
          variant="tonal"
          leadingIcon={<EditIcon />}
          leadingLabel="Edit"
          menuLabel={`More ${size} edit options`}
          menu={sendMenu()}
        />
      ))}
    </div>
  ),
};

/** Disabled, per style: both halves at Button's disabled colours. */
export const Disabled: Story = {
  render: () => (
    <div className="flex w-fit items-center gap-6" data-testid="disabled">
      {VARIANTS.map((variant) => (
        <SplitButton
          key={variant}
          variant={variant}
          leadingIcon={<EditIcon />}
          menuLabel={`${variant} disabled options`}
          menu={sendMenu()}
          disabled
        >
          Edit
        </SplitButton>
      ))}
    </div>
  ),
};

export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <SplitButton
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          leadingIcon={<SendIcon />}
          menuLabel="More send options"
          menu={sendMenu()}
          onPress={() => setCount((c) => c + 1)}
        >
          Send
        </SplitButton>
      </div>
    );
  },
};
