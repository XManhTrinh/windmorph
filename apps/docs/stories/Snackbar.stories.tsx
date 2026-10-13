import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Snackbar, SnackbarHost, useSnackbarHostState } from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  args: { children: 'Message archived', actionLabel: 'Undo', actionOnNewLine: false },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A snackbar shown directly. */
export const Playground: Story = {};

/** The layouts: message only, with an action, with a dismiss button, and stacked. */
export const Layouts: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-4" data-testid="layouts">
      <Snackbar>Photo saved</Snackbar>
      <Snackbar actionLabel="Undo">Message archived</Snackbar>
      <Snackbar actionLabel="Retry" onDismiss={() => {}}>
        Couldn’t send message
      </Snackbar>
      <Snackbar onDismiss={() => {}}>
        Your storage is almost full. Delete files to keep syncing across your devices.
      </Snackbar>
      <Snackbar actionLabel="Open settings" actionOnNewLine onDismiss={() => {}}>
        Notifications are off for this app
      </Snackbar>
    </div>
  ),
};

/** `SnackbarHost` with a queue: each button queues a snackbar. */
export const Host: Story = {
  render: function HostStory() {
    const snackbar = useSnackbarHostState();
    const [result, setResult] = useState('none');
    return (
      <div className="relative flex h-[360px] max-w-[640px] flex-col gap-4 overflow-hidden rounded-corner-large bg-surface-container p-4">
        <div className="flex flex-wrap gap-2">
          <Button onPress={() => void snackbar.showSnackbar('Photo saved')}>Short</Button>
          <Button
            onPress={async () =>
              setResult(
                await snackbar.showSnackbar({ message: 'Message archived', actionLabel: 'Undo' }),
              )
            }
          >
            With action
          </Button>
          <Button
            onPress={() =>
              void snackbar.showSnackbar({
                message: 'Draft discarded',
                withDismissAction: true,
                duration: 'long',
              })
            }
          >
            Dismissible
          </Button>
          <Button onPress={() => void snackbar.showSnackbar('Photos uploaded', { replace: true })}>
            Replace
          </Button>
        </div>
        <p className="text-body-medium" data-testid="result">
          Result: {result}
        </p>
        <SnackbarHost state={snackbar} data-testid="host" className="absolute inset-x-0 bottom-0" />
      </div>
    );
  },
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
        <Snackbar
          data-testid="target"
          className={`w-[360px] ${LAYOUT_OVERRIDES[override]}`}
          actionLabel="Undo"
          onAction={() => setCount((c) => c + 1)}
        >
          Archived
        </Snackbar>
      </div>
    );
  },
};
