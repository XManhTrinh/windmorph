'use client';

import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Button,
  ContextMenuTrigger,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  OptionPopover,
  PullToRefresh,
  Select,
  SelectItem,
  SelectSection,
  SnackbarHost,
  SplitButton,
  SubmenuTrigger,
  Tab,
  Tabs,
  TimePickerModeToggle,
  useSnackbarHostState,
} from '@windmorph/react';
import { DomDirectionLocale, SelectionControl } from '@windmorph/react/primitives';
import { useRef, useState, type ReactNode } from 'react';

function SnackbarHostExample() {
  const state = useSnackbarHostState();
  return <SnackbarHost state={state} />;
}

function TimePickerModeToggleExample() {
  const [mode, setMode] = useState<'dial' | 'input'>('dial');
  return <TimePickerModeToggle mode={mode} onModeChange={setMode} />;
}

function OptionPopoverExample() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const state = {
    isOpen,
    setOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((open) => !open),
    point: null,
    setPoint: () => undefined,
  };
  return (
    <>
      <button ref={triggerRef} type="button" onClick={state.toggle}>
        Options
      </button>
      <OptionPopover state={state} triggerRef={triggerRef} popoverRef={popoverRef}>
        <p className="p-4">Options</p>
      </OptionPopover>
    </>
  );
}

function SelectionControlExample() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <SelectionControl
      rootProps={{}}
      inputProps={{ type: 'checkbox', 'aria-label': 'Agree' }}
      inputRef={inputRef}
      state={{}}
      indicator={<span className="size-4 rounded-corner-extra-small border-2 border-on-surface" />}
    >
      Agree
    </SelectionControl>
  );
}

const menu = (
  <Menu aria-label="Message actions">
    <MenuGroup title="Edit">
      <MenuItem key="reply">Reply</MenuItem>
      <MenuItem key="forward">Forward</MenuItem>
    </MenuGroup>
    <SubmenuTrigger>
      <MenuItem key="move">Move to</MenuItem>
      <Menu aria-label="Folders">
        <MenuItem key="archive">Archive</MenuItem>
      </Menu>
    </SubmenuTrigger>
  </Menu>
);

const menuTrigger = (
  <MenuTrigger>
    <Button variant="outlined">Actions</Button>
    {menu}
  </MenuTrigger>
);

const select = (
  <Select label="Sort by" defaultValue="newest">
    <SelectSection title="Date">
      <SelectItem key="newest">Newest first</SelectItem>
      <SelectItem key="oldest">Oldest first</SelectItem>
    </SelectSection>
    <SelectItem key="price">Price, low to high</SelectItem>
  </Select>
);

const autocomplete = (
  <Autocomplete label="City">
    <AutocompleteSection title="Europe">
      <AutocompleteItem key="london">London</AutocompleteItem>
      <AutocompleteItem key="paris">Paris</AutocompleteItem>
    </AutocompleteSection>
    <AutocompleteItem key="sydney">Sydney</AutocompleteItem>
  </Autocomplete>
);

const tabs = (
  <Tabs aria-label="Mailbox">
    <Tab key="all" title="All">
      All mail
    </Tab>
    <Tab key="sent" title="Sent">
      Sent mail
    </Tab>
  </Tabs>
);

/** The exports a server component can import but can't render with server-made props. */
const EXAMPLES: Record<string, () => ReactNode> = {
  SnackbarHost: () => <SnackbarHostExample />,
  PullToRefresh: () => (
    <PullToRefresh onRefresh={() => undefined} className="h-24 overflow-y-auto">
      <p className="p-2">Pull down to refresh</p>
    </PullToRefresh>
  ),
  Tabs: () => tabs,
  Tab: () => tabs,
  SplitButton: () => (
    <SplitButton menuLabel="More send options" menu={menu}>
      Send
    </SplitButton>
  ),
  Select: () => select,
  SelectItem: () => select,
  SelectSection: () => select,
  Autocomplete: () => autocomplete,
  AutocompleteItem: () => autocomplete,
  AutocompleteSection: () => autocomplete,
  OptionPopover: () => <OptionPopoverExample />,
  Menu: () => menuTrigger,
  MenuItem: () => menuTrigger,
  MenuGroup: () => menuTrigger,
  MenuTrigger: () => menuTrigger,
  SubmenuTrigger: () => menuTrigger,
  ContextMenuTrigger: () => (
    <ContextMenuTrigger>
      <p className="p-2">Right-click here</p>
      {menu}
    </ContextMenuTrigger>
  ),
  TimePickerModeToggle: () => <TimePickerModeToggleExample />,
  DomDirectionLocale: () => (
    <DomDirectionLocale>{(ref) => <div ref={ref}>Direction from the DOM</div>}</DomDirectionLocale>
  ),
  SelectionControl: () => <SelectionControlExample />,
};

/** Renders the client-side example for one export, or flags that it has none. */
export function ClientExample({ name }: { name: string }) {
  const example = EXAMPLES[name];
  return example ? example() : <p data-missing-example={name}>No client example</p>;
}
