import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  CircularProgressIndicator,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from '@windmorph/react';
import { useRef, useState } from 'react';
import { AddIcon, SendIcon, StarIcon, StarOutlineIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const VARIANTS: ButtonVariant[] = ['elevated', 'filled', 'tonal', 'outlined', 'text'];
const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const SHAPES: ButtonShape[] = ['round', 'square'];

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', variant: 'filled', size: 'sm', shape: 'round' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    shape: { control: 'inline-radio', options: SHAPES },
    disabled: { control: 'boolean' },
    pending: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-4">
    <span className="w-24 text-label-medium text-on-surface-variant">{label}</span>
    {children}
  </div>
);

/** Every variant: enabled, with an icon, as an unselected and selected toggle, and disabled. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4" data-testid="variants">
      {VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          <Button variant={variant}>Label</Button>
          <Button variant={variant} leadingIcon={<AddIcon />}>
            Create
          </Button>
          {variant !== 'text' && (
            <>
              <Button toggle variant={variant}>
                Toggle
              </Button>
              <Button toggle defaultSelected variant={variant}>
                Selected
              </Button>
            </>
          )}
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </Row>
      ))}
    </div>
  ),
};

/** XS–XL in both shapes, with and without icons. */
export const SizesAndShapes: Story = {
  render: () => (
    <div className="flex flex-col gap-6" data-testid="sizes">
      {SHAPES.map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-4">
          {SIZES.map((size) => (
            <Button key={size} size={size} shape={shape} leadingIcon={<SendIcon />}>
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        {SIZES.map((size) => (
          <Button key={size} size={size} variant="outlined">
            Next
          </Button>
        ))}
      </div>
    </div>
  ),
};

/**
 * Toggle buttons swap shape when selected: round → square, square → round. The star swaps
 * its outlined icon for the filled one (`selectedLeadingIcon`).
 */
export const Toggle: Story = {
  render: function ToggleStory() {
    const [starred, setStarred] = useState(false);
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button
          toggle
          size="md"
          selected={starred}
          onSelectedChange={setStarred}
          leadingIcon={<StarOutlineIcon />}
          selectedLeadingIcon={<StarIcon />}
        >
          {starred ? 'Starred' : 'Star'}
        </Button>
        <Button toggle size="md" shape="square" variant="tonal">
          Square toggle
        </Button>
        <Button toggle size="md" variant="outlined">
          Outlined toggle
        </Button>
      </div>
    );
  },
};

/** Disabled outlined buttons: a plain one, an unselected toggle and a selected toggle. */
export const DisabledOutlined: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4" data-testid="disabled-outlined">
      <Button variant="outlined" disabled>
        Plain
      </Button>
      <Button toggle variant="outlined" disabled>
        Unselected
      </Button>
      <Button toggle defaultSelected variant="outlined" disabled>
        Selected
      </Button>
    </div>
  ),
};

/**
 * `pending` on every variant and size, with a short and a long label: the indicator replaces
 * the content after 200ms and the button keeps its size. Turn `pending` off to compare. The last
 * row: disabled and pending, a pending link, and a replaced indicator.
 */
export const Pending: StoryObj<{ pending: boolean }> = {
  args: { pending: true },
  render: ({ pending }) => (
    <div className="flex flex-col gap-4" data-testid="pending">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={variant}
              size={size}
              pending={pending}
              leadingIcon={size === 'md' ? <SendIcon /> : undefined}
              data-testid={`pending-${variant}-${size}`}
            >
              Save
            </Button>
          ))}
          <Button variant={variant} pending={pending} data-testid={`pending-${variant}-long`}>
            Check for updates
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <Button pending={pending} disabled data-testid="pending-disabled">
          Disabled
        </Button>
        <Button pending={pending} href="#report" variant="text" data-testid="pending-link">
          Report
        </Button>
        <Button
          pending={pending}
          variant="tonal"
          pendingIndicator={<CircularProgressIndicator size={24} aria-label="Exporting" />}
          data-testid="pending-custom"
        >
          Export
        </Button>
      </div>
    </div>
  ),
};

/**
 * Press Save (or focus it and press Enter): it stays pending for `duration` ms, keeping focus,
 * then says it's saved. Under 200ms nothing visible changes.
 */
export const PendingAction: StoryObj<{ duration: number }> = {
  args: { duration: 1500 },
  argTypes: { duration: { control: 'number' } },
  render: function PendingActionStory({ duration }) {
    const [pending, setPending] = useState(false);
    const [saves, setSaves] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const save = () => {
      setPending(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setPending(false);
        setSaves((count) => count + 1);
      }, Number(duration));
    };
    return (
      <div className="flex flex-col items-start gap-4">
        <Button size="md" pending={pending} onPress={save} data-testid="save">
          Save
        </Button>
        <p className="text-body-medium" data-testid="saves">
          Saved {saves}
        </p>
      </div>
    );
  },
};

export const Link: Story = {
  args: { href: 'https://m3.material.io/components/buttons', variant: 'text', children: 'Spec' },
};

/**
 * Layout safety (architecture §10): the same button with a consumer layout class, inside
 * an optional transformed ancestor. It must look and behave the same in every case.
 */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  pending: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false, pending: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function LayoutOverrideStory({ override, transformedAncestor, pending }) {
    const [count, setCount] = useState(0);
    return (
      <div
        className={transformedAncestor ? 'translate-x-2' : undefined}
        data-testid="ancestor"
        style={{ minHeight: 200 }}
      >
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <Button
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          leadingIcon={<AddIcon />}
          // Left out when off, so the default matrix renders the plain button.
          pending={pending || undefined}
          onPress={() => setCount((c) => c + 1)}
        >
          Layout
        </Button>
      </div>
    );
  },
};
