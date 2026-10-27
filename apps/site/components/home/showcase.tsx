'use client';

import {
  Button,
  Checkbox,
  CircularProgressIndicator,
  LinearProgressIndicator,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  SnackbarHost,
  useSnackbarHostState,
} from '@windmorph/react';

function Buttons() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="elevated">Elevated</Button>
        <Button variant="filled">Filled</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="filled" size="xs">
          XS
        </Button>
        <Button variant="filled" size="sm">
          SM
        </Button>
        <Button variant="filled" size="md">
          MD
        </Button>
        <Button variant="filled" size="lg">
          LG
        </Button>
      </div>
    </div>
  );
}

function Inputs() {
  return (
    <div className="flex flex-col gap-6">
      <TextField label="Full name" className="max-w-sm" />
      <div className="flex flex-wrap items-center gap-6">
        <Checkbox defaultChecked>Subscribe</Checkbox>
        <Switch defaultChecked icons>
          Wi-Fi
        </Switch>
      </div>
      <Slider aria-label="Volume" size="md" defaultValue={60} className="max-w-sm" />
    </div>
  );
}

function Feedback() {
  const snackbar = useSnackbarHostState();
  return (
    <div className="relative flex min-h-[220px] flex-col gap-6 overflow-hidden rounded-corner-large bg-surface-container p-4">
      <Button
        variant="filled"
        onPress={() =>
          void snackbar.showSnackbar({ message: 'Photo saved', withDismissAction: true })
        }
      >
        Show snackbar
      </Button>
      <div className="flex flex-wrap items-center gap-8">
        <LinearProgressIndicator value={0.6} aria-label="Progress" className="w-[200px]" />
        <CircularProgressIndicator value={0.75} aria-label="Loading" />
      </div>
      <SnackbarHost state={snackbar} className="absolute inset-x-0 bottom-0" />
    </div>
  );
}

/** The homepage "See it in action" tabbed live demo — the only interactive part of the hero. */
export function Showcase() {
  return (
    <Tabs aria-label="Component showcase">
      <Tab key="buttons" title="Buttons">
        <div className="pt-6">
          <Buttons />
        </div>
      </Tab>
      <Tab key="inputs" title="Inputs">
        <div className="pt-6">
          <Inputs />
        </div>
      </Tab>
      <Tab key="feedback" title="Feedback">
        <div className="pt-6">
          <Feedback />
        </div>
      </Tab>
    </Tabs>
  );
}
