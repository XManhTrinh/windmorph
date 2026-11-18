import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge,
  Button,
  Card,
  ContextMenuTrigger,
  IconButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
  DENSITIES,
  type Density as DensityLevel,
  type MenuAfterSelect,
  type MenuLayout,
  type MenuPresentation,
  type MenuSubmenuPresentation,
  type MenuSubmenuTransition,
  type MenuVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const MoreIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
  </svg>
);

const meta = {
  title: 'Components/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<{
  variant: MenuVariant;
  layout: MenuLayout;
  presentation?: MenuPresentation;
  instant?: boolean;
}>;

/**
 * Grouped items with icons, a description and shortcuts. Groups are set apart by dividers
 * (the default, as M3 recommends on the web) or by gaps. `presentation` opens the menu in
 * a bottom sheet (`sheet`, or `auto` on compact windows); `instant` drops the motion.
 */
export const Grouped: Story = {
  args: { variant: 'standard', layout: 'divider', presentation: 'popover', instant: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'vibrant'] },
    layout: { control: 'inline-radio', options: ['divider', 'gap'] },
    presentation: { control: 'inline-radio', options: ['popover', 'sheet', 'auto'] },
    instant: { control: 'boolean' },
  },
  render: function GroupedStory({ variant, layout, presentation, instant }) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <MenuTrigger>
          <IconButton variant="standard" icon={<MoreIcon />} aria-label="More" />
          <Menu
            variant={variant}
            layout={layout}
            presentation={presentation}
            instant={instant}
            onAction={(key) => setLast(String(key))}
            disabledKeys={['star']}
          >
            <MenuGroup title="Edit">
              <MenuItem key="add" leadingIcon={<AddIcon />} shortcut="⌘N">
                New
              </MenuItem>
              <MenuItem key="edit" leadingIcon={<EditIcon />} description="Rename or move">
                Edit
              </MenuItem>
              <MenuItem key="search" leadingIcon={<SearchIcon />} shortcut="⌘F">
                Find
              </MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="More actions">
              <MenuItem key="star" leadingIcon={<StarIcon />}>
                Favourite
              </MenuItem>
              <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
                Delete
              </MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

/**
 * Web density (M3: "On web only … decreases the top and bottom padding"): open at a level,
 * items lose 4px per step (44 → 32px) and the space around dividers 2px.
 */
export const Density: StoryObj<{ density: DensityLevel; variant: MenuVariant }> = {
  args: { density: -2, variant: 'standard' },
  argTypes: {
    density: { control: 'inline-radio', options: [...DENSITIES] },
    variant: { control: 'inline-radio', options: ['standard', 'vibrant'] },
  },
  render: ({ density, variant }) => (
    <div style={{ minHeight: 420 }} data-testid="density">
      <MenuTrigger defaultOpen>
        <Button variant="outlined">Actions</Button>
        <Menu aria-label="Actions" density={density} variant={variant} selectionMode="single">
          <MenuGroup title="Edit">
            <MenuItem key="add" leadingIcon={<AddIcon />} shortcut="⌘N">
              New
            </MenuItem>
            <MenuItem key="edit" leadingIcon={<EditIcon />} description="Rename or move">
              Edit
            </MenuItem>
            <MenuItem key="search" leadingIcon={<SearchIcon />} shortcut="⌘F">
              Find
            </MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="More actions">
            <MenuItem key="star" leadingIcon={<StarIcon />}>
              Favourite
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>
    </div>
  ),
};

/** Single selection: the selected item takes the selected shape and a check expands in. */
export const SingleSelection: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function SelectionStory({ variant }) {
    const [sort, setSort] = useState(new Set(['name']));
    return (
      <MenuTrigger>
        <Button variant="tonal">Sort by {[...sort][0]}</Button>
        <Menu
          variant={variant}
          aria-label="Sort by"
          selectionMode="single"
          selectedKeys={sort}
          onSelectionChange={(keys) => setSort(new Set([...(keys as Set<string>)]))}
        >
          <MenuItem key="name">Name</MenuItem>
          <MenuItem key="date">Date modified</MenuItem>
          <MenuItem key="size">Size</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  },
};

/**
 * A group of choices beside plain actions: the `MenuGroup` takes the selection, so its items
 * are radio items with the current one checked, and the actions after it stay actions.
 */
export const ChoicesBesideActions: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function ChoicesStory({ variant, layout }) {
    const [account, setAccount] = useState(new Set(['alex']));
    return (
      <MenuTrigger>
        <Button variant="tonal">Account</Button>
        <Menu variant={variant} layout={layout} aria-label="Account">
          <MenuGroup
            title="Signed in as"
            selectionMode="single"
            deselectable={false}
            selectedKeys={account}
            onSelectionChange={(keys) => setAccount(new Set([...(keys as Set<string>)]))}
          >
            <MenuItem key="alex">Alex Morgan</MenuItem>
            <MenuItem key="studio">Morgan Studio</MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="Accounts">
            <MenuItem key="add">Add an account</MenuItem>
            <MenuItem key="settings">Settings</MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>
    );
  },
};

/**
 * Items with `href` are real links with the item's look and keys: following one closes the
 * menu, a modified click or the browser's link menu opens it in a new tab, and `download`
 * saves the file. Inside a `RouterProvider`, a plain click goes through the app's router.
 */
export const Links: Story = {
  args: { variant: 'standard', layout: 'divider', presentation: 'popover' },
  render: ({ variant, presentation }) => (
    <MenuTrigger>
      <Button variant="tonal">Help</Button>
      <Menu variant={variant} presentation={presentation} aria-label="Help">
        <MenuItem key="guide" href="#guide">
          Read the guide
        </MenuItem>
        <MenuItem key="shortcuts" href="#shortcuts">
          Keyboard shortcuts
        </MenuItem>
        <MenuItem
          key="notes"
          href="data:text/plain;charset=utf-8,Release%20notes"
          download="release-notes.txt"
        >
          Download the release notes
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/**
 * Submenus open beside their item on hover, press or the arrow key. While one is open, the
 * item that opened it keeps a pressed layer and the menu holding focus has rounder corners.
 */
export const Submenus: Story = {
  args: { variant: 'standard', layout: 'divider', presentation: 'popover' },
  argTypes: {
    presentation: { control: 'inline-radio', options: ['popover', 'sheet', 'auto'] },
  },
  render: function SubmenuStory({ variant, layout, presentation }) {
    const [last, setLast] = useState('none');
    const run = (key: unknown) => setLast(String(key));
    return (
      <div className="flex flex-col items-start gap-4">
        <MenuTrigger>
          <Button variant="tonal">File</Button>
          <Menu variant={variant} layout={layout} presentation={presentation} onAction={run}>
            <MenuItem key="new" leadingIcon={<AddIcon />}>
              New
            </MenuItem>
            <SubmenuTrigger>
              <MenuItem key="share" leadingIcon={<SendIcon />}>
                Share
              </MenuItem>
              <Menu aria-label="Share" onAction={run}>
                <MenuItem key="email">Email</MenuItem>
                <MenuItem key="link">Copy link</MenuItem>
                <SubmenuTrigger>
                  <MenuItem key="export">Export as</MenuItem>
                  <Menu aria-label="Export as" onAction={run}>
                    <MenuItem key="pdf">PDF</MenuItem>
                    <MenuItem key="csv">CSV</MenuItem>
                  </Menu>
                </SubmenuTrigger>
              </Menu>
            </SubmenuTrigger>
            <MenuItem key="inbox" badge={<Badge>3</Badge>}>
              Inbox
            </MenuItem>
          </Menu>
        </MenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

const SettingsIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
  </svg>
);

/** Consumer classes on the player for the container's override matrix (architecture §10). */
const PLAYER_OVERRIDES = {
  none: '',
  static: 'static',
  overflowHidden: 'overflow-hidden',
  transform: '[transform:translateX(0px)]',
  translate: 'translate-x-[0px]',
  containPaint: '[contain:paint]',
} as const;

// Each page's choices, in order (an object would put the number-like keys first).
const QUALITIES = [
  ['auto', 'Auto'],
  ['1080', '1080p'],
  ['720', '720p'],
  ['480', '480p'],
  ['360', '360p'],
] as const;
const SPEEDS = [
  ['0.5', '0.5×'],
  ['1', 'Normal'],
  ['1.5', '1.5×'],
  ['2', '2×'],
] as const;
const SUBTITLES = [
  ['off', 'Off'],
  ['en', 'English'],
  ['fr', 'French'],
] as const;
const SIZES = [
  ['small', 'Small'],
  ['medium', 'Medium'],
  ['large', 'Large'],
] as const;

/** The label of a single selection's one key. */
const chosen = (choices: readonly (readonly [string, string])[], keys: Set<string>) =>
  choices.find(([key]) => keys.has(key))?.[1];

/** Keeps a selection as a set of string keys. */
const keep = (set: (keys: Set<string>) => void) => (keys: unknown) =>
  set(new Set(keys as Set<string>));

/**
 * A video player's settings menu (`submenuPresentation="replace"`, `portalContainer`): it opens
 * over the picture from the settings button in the player's bottom end corner, inside the
 * player, so it moves with it and shows in full screen. Quality, Playback speed and Subtitles
 * (with a Font size page of its own) replace the content on the same surface, below a back
 * button, and a choice goes back to the first page (`afterSelect="back"`), which shows it.
 * `corner` puts the controls at the top, so the menu opens below its trigger; `flip` asks for
 * the side with no room in the player; `override` puts a consumer class on the player;
 * `triggerOutside` puts the button below the player; `inPlayer` off opens it in `body`.
 */
export const PlayerSettings: StoryObj<{
  variant: MenuVariant;
  submenuPresentation: MenuSubmenuPresentation;
  submenuTransition: MenuSubmenuTransition;
  afterSelect: MenuAfterSelect;
  inPlayer: boolean;
  corner: 'bottom' | 'top';
  override: keyof typeof PLAYER_OVERRIDES;
  triggerOutside: boolean;
  flip: boolean;
  instant: boolean;
}> = {
  args: {
    variant: 'standard',
    submenuPresentation: 'replace',
    submenuTransition: 'fade',
    afterSelect: 'back',
    inPlayer: true,
    corner: 'bottom',
    override: 'none',
    triggerOutside: false,
    flip: false,
    instant: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'vibrant'] },
    submenuPresentation: { control: 'inline-radio', options: ['beside', 'replace'] },
    submenuTransition: { control: 'inline-radio', options: ['fade', 'slide'] },
    afterSelect: { control: 'inline-radio', options: ['close', 'back'] },
    corner: { control: 'inline-radio', options: ['bottom', 'top'] },
    override: { control: 'select', options: Object.keys(PLAYER_OVERRIDES) },
  },
  render: function PlayerSettingsStory({
    variant,
    submenuPresentation,
    submenuTransition,
    afterSelect,
    inPlayer,
    corner,
    override,
    triggerOutside,
    flip,
    instant,
  }) {
    const [player, setPlayer] = useState<HTMLDivElement | null>(null);
    const [quality, setQuality] = useState(new Set(['auto']));
    const [speed, setSpeed] = useState(new Set(['1']));
    const [subtitles, setSubtitles] = useState(new Set(['off']));
    const [size, setSize] = useState(new Set(['medium']));
    const [loop, setLoop] = useState(new Set<string>());
    const page = { selectionMode: 'single', deselectable: false, afterSelect } as const;
    const settings = (
      <MenuTrigger>
        <IconButton variant="standard" icon={<SettingsIcon />} aria-label="Settings" />
        <Menu
          aria-label="Settings"
          variant={variant}
          instant={instant}
          submenuPresentation={submenuPresentation}
          submenuTransition={submenuTransition}
          portalContainer={inPlayer ? player : null}
          // Away from the trigger's edge of the player, unless `flip` asks for the side
          // without room, which the menu then flips from.
          placement={(corner === 'bottom' || triggerOutside) !== flip ? 'top-end' : 'bottom-end'}
          offset={8}
        >
          <SubmenuTrigger>
            <MenuItem key="quality" description={chosen(QUALITIES, quality)}>
              Quality
            </MenuItem>
            <Menu {...page} selectedKeys={quality} onSelectionChange={keep(setQuality)}>
              {QUALITIES.map(([key, label]) => (
                <MenuItem key={key}>{label}</MenuItem>
              ))}
            </Menu>
          </SubmenuTrigger>
          <SubmenuTrigger>
            <MenuItem key="speed" description={chosen(SPEEDS, speed)}>
              Playback speed
            </MenuItem>
            <Menu {...page} selectedKeys={speed} onSelectionChange={keep(setSpeed)}>
              {SPEEDS.map(([key, label]) => (
                <MenuItem key={key}>{label}</MenuItem>
              ))}
            </Menu>
          </SubmenuTrigger>
          <SubmenuTrigger>
            <MenuItem key="subtitles" description={chosen(SUBTITLES, subtitles)}>
              Subtitles
            </MenuItem>
            <Menu {...page} selectedKeys={subtitles} onSelectionChange={keep(setSubtitles)}>
              <MenuGroup aria-label="Language">
                {SUBTITLES.map(([key, label]) => (
                  <MenuItem key={key}>{label}</MenuItem>
                ))}
              </MenuGroup>
              <MenuGroup aria-label="Appearance" selectionMode="none">
                <SubmenuTrigger>
                  <MenuItem key="size" description={chosen(SIZES, size)}>
                    Font size
                  </MenuItem>
                  <Menu {...page} selectedKeys={size} onSelectionChange={keep(setSize)}>
                    {SIZES.map(([key, label]) => (
                      <MenuItem key={key}>{label}</MenuItem>
                    ))}
                  </Menu>
                </SubmenuTrigger>
              </MenuGroup>
            </Menu>
          </SubmenuTrigger>
          <MenuGroup
            aria-label="Playback"
            selectionMode="multiple"
            selectedKeys={loop}
            onSelectionChange={keep(setLoop)}
          >
            <MenuItem key="loop">Loop</MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>
    );
    const fullscreen = (
      <IconButton
        variant="standard"
        icon={<FullscreenIcon />}
        aria-label="Full screen"
        onPress={() =>
          document.fullscreenElement ? document.exitFullscreen() : player?.requestFullscreen()
        }
      />
    );
    return (
      <div
        data-testid="pane"
        className="h-[480px] w-[720px] max-w-full overflow-auto rounded-corner-large bg-surface p-[24px]"
      >
        <div
          ref={setPlayer}
          data-testid="player"
          // The controls are in the player's flow, so a consumer class on it (`static`) moves
          // only what positions against it: the menu.
          className={`relative flex aspect-video w-[640px] max-w-full flex-col rounded-corner-medium bg-surface-container-highest ${corner === 'bottom' ? 'justify-end' : 'justify-start'} ${PLAYER_OVERRIDES[override]}`}
        >
          <div className="flex justify-end gap-[4px] p-[8px]">
            {!triggerOutside && settings}
            {fullscreen}
          </div>
        </div>
        {triggerOutside && <div className="flex justify-end pt-[8px]">{settings}</div>}
        <p className="h-[320px] pt-[16px] text-body-medium text-on-surface-variant">
          Loop: {loop.size ? 'on' : 'off'}
        </p>
      </div>
    );
  },
};

/** A secondary click (or Shift + F10, or a long press) opens a context menu at the pointer. */
export const ContextMenu: Story = {
  args: { variant: 'standard', layout: 'divider' },
  render: function ContextMenuStory({ variant, layout }) {
    const [last, setLast] = useState('none');
    return (
      <div className="flex flex-col items-start gap-4">
        <ContextMenuTrigger>
          <Card
            variant="outlined"
            tabIndex={0}
            className="w-[320px] p-[16px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            data-testid="target"
          >
            <p className="text-body-large">Right-click this card</p>
          </Card>
          <Menu
            aria-label="Card actions"
            variant={variant}
            layout={layout}
            onAction={(key) => setLast(String(key))}
          >
            <MenuItem key="edit" leadingIcon={<EditIcon />}>
              Edit
            </MenuItem>
            <MenuItem key="star" leadingIcon={<StarIcon />}>
              Favourite
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </ContextMenuTrigger>
        <p className="text-body-medium" data-testid="last">
          Last action: {last}
        </p>
      </div>
    );
  },
};

/** A long menu scrolls; a `gap` menu that has to scroll switches to dividers (M3). */
export const Scrolling: Story = {
  args: { variant: 'standard', layout: 'gap' },
  render: ({ variant, layout }) => (
    <MenuTrigger>
      <Button variant="outlined">Country</Button>
      <Menu aria-label="Country" variant={variant} layout={layout}>
        {Array.from({ length: 4 }, (_, group) => (
          <MenuGroup key={group} aria-label={`Region ${group + 1}`}>
            {Array.from({ length: 8 }, (_, item) => (
              <MenuItem key={`${group}-${item}`}>{`Option ${group * 8 + item + 1}`}</MenuItem>
            ))}
          </MenuGroup>
        ))}
      </Menu>
    </MenuTrigger>
  ),
};

/**
 * Layout safety (architecture §10): a consumer layout class on the trigger (`part:
 * trigger`) or on the menu (`className`, which goes on its outermost element, the box React
 * Aria places; `part: panel`), inside an optional transformed ancestor. The trigger keeps
 * its size, corners, state layer and focus ring; the menu still opens against it in the
 * window, keeps its size and corners, and takes and returns focus.
 */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  part: 'trigger' | 'panel';
}> = {
  args: { override: 'none', transformedAncestor: false, part: 'trigger' },
  argTypes: {
    override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
    part: { control: 'inline-radio', options: ['trigger', 'panel'] },
  },
  render: function LayoutOverrideStory({ override, transformedAncestor, part }) {
    const [last, setLast] = useState('none');
    const layout = LAYOUT_OVERRIDES[override];
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Last action: {last}
        </p>
        <MenuTrigger>
          <IconButton
            data-testid="target"
            variant="standard"
            icon={<MoreIcon />}
            aria-label="More"
            className={part === 'trigger' ? layout : undefined}
          />
          <Menu
            aria-label="More"
            className={part === 'panel' ? layout : undefined}
            onAction={(key) => setLast(String(key))}
          >
            <MenuItem key="edit" leadingIcon={<EditIcon />}>
              Edit
            </MenuItem>
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
    );
  },
};
