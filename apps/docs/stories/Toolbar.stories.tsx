import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DockedToolbar,
  FloatingToolbar,
  IconButton,
  ToolbarFab,
  useToolbarScrollExit,
  useToolbarScrollExpansion,
  type FloatingToolbarColor,
  type IconTransition,
} from '@windmorph/react';
import { useRef, useState } from 'react';
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from './icons';
import { TallPage } from './scroll-anchoring';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  color: FloatingToolbarColor;
  expanded: boolean;
}

const meta = {
  title: 'Components/Toolbar',
  args: { color: 'standard', expanded: true },
  argTypes: { color: { control: 'inline-radio', options: ['standard', 'vibrant'] } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const formatting = (
  <>
    <IconButton toggle icon={<FormatBoldIcon />} aria-label="Bold" />
    <IconButton toggle icon={<FormatItalicIcon />} aria-label="Italic" />
    <IconButton toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />
  </>
);
const leading = <IconButton icon={<EditIcon />} aria-label="Edit" />;
const trailing = <IconButton icon={<DeleteIcon />} aria-label="Delete" />;

export const Playground: Story = {
  render: ({ color, expanded }) => (
    <FloatingToolbar
      aria-label="Formatting"
      color={color}
      expanded={expanded}
      leading={leading}
      trailing={trailing}
    >
      {formatting}
    </FloatingToolbar>
  ),
};

/** Standard and vibrant, expanded and collapsed, horizontal and vertical. */
export const Floating: Story = {
  render: () => (
    <div className="flex items-start gap-8" data-testid="floating">
      <div className="flex flex-col items-start gap-6">
        {(['standard', 'vibrant'] as const).map((color) =>
          [true, false].map((expanded) => (
            <FloatingToolbar
              key={`${color}-${expanded}`}
              aria-label={`${color} ${expanded ? 'expanded' : 'collapsed'}`}
              color={color}
              expanded={expanded}
              leading={leading}
              trailing={trailing}
            >
              {formatting}
            </FloatingToolbar>
          )),
        )}
      </div>
      {(['standard', 'vibrant'] as const).map((color) => (
        <FloatingToolbar
          key={color}
          aria-label={`${color} vertical`}
          orientation="vertical"
          color={color}
          leading={leading}
          trailing={trailing}
        >
          {formatting}
        </FloatingToolbar>
      ))}
    </div>
  ),
};

/**
 * The icon-button roles of each colour scheme (M3 toolbar colour spec): filled, a selected
 * tonal toggle and standard buttons; vibrant toolbars recolour the toggle and the standard
 * buttons. Last, a toolbar without elevation for visually distinct content.
 */
export const ButtonColors: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6" data-testid="button-colors">
      {(['standard', 'vibrant'] as const).map((color) => (
        <FloatingToolbar key={color} aria-label={color} color={color}>
          <IconButton variant="filled" icon={<EditIcon />} aria-label="Compose" />
          <IconButton
            toggle
            variant="tonal"
            defaultSelected
            icon={<FormatBoldIcon />}
            aria-label="Bold"
          />
          <IconButton toggle variant="tonal" icon={<FormatItalicIcon />} aria-label="Italic" />
          <IconButton icon={<SearchIcon />} aria-label="Search" />
        </FloatingToolbar>
      ))}
      <FloatingToolbar aria-label="flat" elevated={false}>
        {formatting}
      </FloatingToolbar>
    </div>
  ),
};

/** With a FAB: expanded and collapsed, at either side, horizontal and vertical. */
export const WithFab: Story = {
  render: () => (
    <div className="flex items-start gap-8" data-testid="with-fab">
      <div className="flex flex-col items-start gap-6">
        {(['standard', 'vibrant'] as const).map((color) =>
          (['end', 'start'] as const).map((fabPlacement) => (
            <FloatingToolbar
              key={`${color}-${fabPlacement}`}
              aria-label={`${color} ${fabPlacement}`}
              color={color}
              fabPlacement={fabPlacement}
              fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}
            >
              {formatting}
            </FloatingToolbar>
          )),
        )}
        <FloatingToolbar
          aria-label="collapsed"
          expanded={false}
          fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}
        >
          {formatting}
        </FloatingToolbar>
      </div>
      <FloatingToolbar
        aria-label="vertical"
        orientation="vertical"
        fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}
      >
        {formatting}
      </FloatingToolbar>
      <FloatingToolbar
        aria-label="vertical top"
        orientation="vertical"
        color="vibrant"
        fabPlacement="top"
        fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}
      >
        {formatting}
      </FloatingToolbar>
    </div>
  ),
};

/** Toggle `expanded` to watch the collapse (leading / trailing, or the toolbar beside a FAB). */
export const Collapse: StoryObj<{ withFab: boolean; vertical: boolean }> = {
  args: { withFab: false, vertical: false },
  render: function CollapseStory({ withFab, vertical }) {
    const [expanded, setExpanded] = useState(true);
    const orientation = vertical ? 'vertical' : 'horizontal';
    return (
      <div className="flex flex-col items-start gap-6">
        <button
          type="button"
          className="text-label-large text-primary underline"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
        {withFab ? (
          <FloatingToolbar
            aria-label="Formatting"
            data-testid="toolbar"
            orientation={orientation}
            expanded={expanded}
            fab={<ToolbarFab icon={<AddIcon />} aria-label="New" data-testid="fab" />}
          >
            {formatting}
          </FloatingToolbar>
        ) : (
          <FloatingToolbar
            aria-label="Formatting"
            data-testid="toolbar"
            orientation={orientation}
            expanded={expanded}
            leading={leading}
            trailing={trailing}
          >
            {formatting}
          </FloatingToolbar>
        )}
        <button type="button" className="text-label-large">
          After
        </button>
      </div>
    );
  },
};

/**
 * A two-state FAB: `expandedIcon` while the toolbar is expanded, `icon` while collapsed.
 * `swap` hands over halfway through the spring (the M3 spec); `rotate` turns and crossfades
 * the icons, beyond the M3 spec, as in Google's Expressive showcase.
 */
export const FabIcons: StoryObj<{ iconTransition: IconTransition }> = {
  args: { iconTransition: 'swap' },
  argTypes: { iconTransition: { control: 'inline-radio', options: ['swap', 'rotate'] } },
  render: function FabIconsStory({ iconTransition }) {
    const [expanded, setExpanded] = useState(false);
    return (
      <FloatingToolbar
        aria-label="Formatting"
        data-testid="toolbar"
        expanded={expanded}
        fab={
          <ToolbarFab
            icon={<EditIcon />}
            expandedIcon={<CloseIcon />}
            iconTransition={iconTransition}
            aria-label={expanded ? 'Close formatting' : 'Format'}
            onPress={() => setExpanded((value) => !value)}
            data-testid="fab"
          />
        }
      >
        {formatting}
      </FloatingToolbar>
    );
  },
};

/** `useToolbarScrollExpansion`: scroll down 40px to collapse, back up 40px to expand. */
export const ScrollExpansion: Story = {
  render: function ScrollStory({ color }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const expanded = useToolbarScrollExpansion({ scrollRef });
    return (
      <div className="relative h-[480px] w-[360px] overflow-hidden rounded-corner-large border border-outline-variant">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4" data-testid="scroller">
          {Array.from({ length: 40 }, (_, index) => (
            <p key={index} className="py-2 text-body-large">
              Message {index + 1}
            </p>
          ))}
        </div>
        <FloatingToolbar
          aria-label="Message actions"
          data-testid="toolbar"
          color={color}
          expanded={expanded}
          className="absolute end-4 bottom-4"
          fab={<ToolbarFab icon={<EditIcon />} aria-label="Compose" />}
        >
          <IconButton icon={<SearchIcon />} aria-label="Search" />
          <IconButton icon={<StarIcon />} aria-label="Starred" />
          <IconButton icon={<SendIcon />} aria-label="Sent" />
        </FloatingToolbar>
      </div>
    );
  },
};

/**
 * `useToolbarScrollExit`: scroll down 40px and the toolbars slide off the screen, back up
 * 40px and they return.
 */
export const ScrollExit: Story = {
  render: function ScrollExitStory({ color }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const visible = useToolbarScrollExit({ scrollRef });
    return (
      <div className="relative h-[480px] w-[360px] overflow-hidden rounded-corner-large border border-outline-variant">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4" data-testid="scroller">
          {Array.from({ length: 40 }, (_, index) => (
            <p key={index} className="py-2 text-body-large">
              Message {index + 1}
            </p>
          ))}
        </div>
        <FloatingToolbar
          aria-label="Formatting"
          data-testid="floating"
          color={color}
          visible={visible}
          exitEdge="end"
          orientation="vertical"
          className="absolute end-6 top-6"
        >
          {formatting}
        </FloatingToolbar>
        <DockedToolbar
          aria-label="Message actions"
          data-testid="docked"
          visible={visible}
          className="absolute inset-x-0 bottom-0"
        >
          <IconButton icon={<SearchIcon />} aria-label="Search" />
          <IconButton icon={<StarIcon />} aria-label="Starred" />
          <IconButton icon={<SendIcon />} aria-label="Sent" />
        </DockedToolbar>
      </div>
    );
  },
};

/**
 * The docked toolbar, centred (the default) and spread out (for compact windows), and in the
 * vibrant colour.
 */
export const Docked: Story = {
  render: () => (
    <div className="flex w-[412px] flex-col gap-6" data-testid="docked">
      {(
        [
          ['centered', 'standard'],
          ['space-between', 'standard'],
          ['centered', 'vibrant'],
        ] as const
      ).map(([arrangement, color]) => (
        <DockedToolbar
          key={`${arrangement}-${color}`}
          aria-label={color === 'vibrant' ? 'vibrant' : arrangement}
          arrangement={arrangement}
          color={color}
        >
          <IconButton icon={<SearchIcon />} aria-label="Search" />
          <IconButton icon={<StarIcon />} aria-label="Starred" />
          <IconButton icon={<SendIcon />} aria-label="Sent" />
          <IconButton variant="filled" icon={<EditIcon />} aria-label="Compose" />
        </DockedToolbar>
      ))}
    </div>
  ),
};

/** Layout safety (architecture §10). */
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
        <FloatingToolbar
          aria-label="Formatting"
          data-testid="target"
          className={LAYOUT_OVERRIDES[override]}
          leading={<IconButton icon={<EditIcon />} aria-label="Edit" />}
        >
          <IconButton
            icon={<FormatBoldIcon />}
            aria-label="Bold"
            onPress={() => setCount((c) => c + 1)}
          />
          <IconButton icon={<FormatItalicIcon />} aria-label="Italic" />
        </FloatingToolbar>
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the docked toolbar. */
export const DockedLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function DockedLayoutOverrideStory({ override, transformedAncestor }) {
    const [count, setCount] = useState(0);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Pressed {count}
        </p>
        <DockedToolbar
          aria-label="Message actions"
          data-testid="target"
          className={`w-[360px] ${LAYOUT_OVERRIDES[override]}`}
        >
          <IconButton
            icon={<SearchIcon />}
            aria-label="Search"
            onPress={() => setCount((c) => c + 1)}
          />
          <IconButton icon={<StarIcon />} aria-label="Starred" />
          <IconButton icon={<SendIcon />} aria-label="Sent" />
        </DockedToolbar>
      </div>
    );
  },
};

/**
 * On a tall page, a vertical floating toolbar with its FAB collapses and expands from a
 * fixed button without scrolling the page (it is never the browser's scroll anchor).
 */
export const ScrollAnchoring: Story = {
  render: function ScrollAnchoringStory() {
    const [expanded, setExpanded] = useState(true);
    return (
      <TallPage onToggle={() => setExpanded((value) => !value)}>
        <FloatingToolbar
          aria-label="Formatting"
          data-testid="toolbar"
          orientation="vertical"
          expanded={expanded}
          className="absolute end-4 bottom-4"
          fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}
        >
          {formatting}
        </FloatingToolbar>
      </TallPage>
    );
  },
};
