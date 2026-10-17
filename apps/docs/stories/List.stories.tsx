import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemImage,
  ListItemVideo,
  ListSection,
  Switch,
  type ListVariant,
} from '@windmorph/react';
import { useState } from 'react';
import { DeleteIcon, FeedIcon, HomeIcon, SearchIcon, SendIcon, StarIcon } from './icons';
import { DensityColumns } from './density-columns';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

interface Args {
  variant: ListVariant;
}

const meta = {
  title: 'Components/List',
  args: { variant: 'segmented' },
  argTypes: { variant: { control: 'inline-radio', options: ['standard', 'segmented'] } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** One-, two- and three-line items with leading and trailing content. */
export const Static: Story = {
  render: ({ variant }) => (
    <div
      className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
      data-testid="static"
    >
      <List aria-label="Contacts" variant={variant}>
        <ListItem key="a" leading={<HomeIcon />} trailing={<StarIcon />}>
          One line
        </ListItem>
        <ListItem
          key="b"
          leading={<ListItemAvatar>B</ListItemAvatar>}
          supportingText="Supporting text"
          trailing="9:41"
        >
          Two lines
        </ListItem>
        <ListItem
          key="c"
          leading={<ListItemAvatar>C</ListItemAvatar>}
          overline="Overline"
          supportingText="Supporting text"
        >
          Three lines
        </ListItem>
        <ListItem key="d">Text only</ListItem>
      </List>
    </div>
  ),
};

/** An interactive list: press or Enter acts, ↑ / ↓ move, ← / → reach the switch. */
export const Interactive: Story = {
  render: function InteractiveStory({ variant }) {
    const [last, setLast] = useState('');
    return (
      <div className="flex w-[360px] flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3">
        <List
          aria-label="Mail"
          variant={variant}
          onAction={(key) => setLast(String(key))}
          data-testid="list"
        >
          <ListItem key="inbox" leading={<HomeIcon />} supportingText="3 new messages">
            Inbox
          </ListItem>
          <ListItem key="starred" leading={<StarIcon />}>
            Starred
          </ListItem>
          <ListItem
            key="sent"
            leading={<SendIcon />}
            trailing={<Switch aria-label="Notify for sent mail" />}
          >
            Sent
          </ListItem>
          <ListItem key="trash" leading={<DeleteIcon />}>
            Trash
          </ListItem>
        </List>
        <p className="px-2 text-body-medium" data-testid="last">
          Opened {last}
        </p>
      </div>
    );
  },
};

/**
 * Multiple selection: a list box of options. Selected items turn secondary-container with
 * 16px corners and show a check, so selection never relies on colour alone.
 */
export const Selection: Story = {
  render: function SelectionStory({ variant }) {
    const [selected, setSelected] = useState<Set<string | number> | 'all'>(new Set(['work']));
    return (
      <div
        className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
        data-testid="selection"
      >
        <List
          aria-label="Labels"
          variant={variant}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
        >
          {['work', 'home', 'travel'].map((key) => (
            <ListItem key={key} leading={<StarIcon />} supportingText={`${key} label`}>
              {key[0]!.toUpperCase() + key.slice(1)}
            </ListItem>
          ))}
        </List>
      </div>
    );
  },
};

/** Items with nested items expand and collapse; → / ← too. */
export const Expandable: Story = {
  render: function ExpandableStory({ variant }) {
    const [expanded, setExpanded] = useState<Set<string | number>>(new Set(['photos']));
    return (
      <div
        className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
        data-testid="expandable"
      >
        <List
          aria-label="Folders"
          variant={variant}
          expandedKeys={expanded}
          onExpandedChange={setExpanded}
        >
          <ListItem
            key="photos"
            leading={<StarIcon />}
            supportingText="2 albums"
            childItems={[
              <ListItem key="trips" leading={<ListItemAvatar>T</ListItemAvatar>}>
                Trips
              </ListItem>,
              <ListItem key="family" leading={<ListItemAvatar>F</ListItemAvatar>}>
                Family
              </ListItem>,
            ]}
          >
            Photos
          </ListItem>
          <ListItem
            key="documents"
            leading={<FeedIcon />}
            childItems={[<ListItem key="taxes">Taxes</ListItem>]}
          >
            Documents
          </ListItem>
          <ListItem key="music" leading={<HomeIcon />}>
            Music
          </ListItem>
        </List>
      </div>
    );
  },
};

/**
 * One item open at a time (the app keeps only the newest key): opening Documents folds Photos
 * in the same change. Under reduced motion the folding rows go at once and the opening ones
 * fade in, so Music moves once.
 */
export const OneOpenAtATime: Story = {
  render: function OneOpenAtATimeStory({ variant }) {
    const [expanded, setExpanded] = useState<Set<string | number>>(new Set(['photos']));
    return (
      <div
        className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
        data-testid="one-open"
      >
        <List
          aria-label="Folders"
          variant={variant}
          expandedKeys={expanded}
          onExpandedChange={(keys) =>
            setExpanded(new Set([...keys].filter((key) => !expanded.has(key))))
          }
        >
          <ListItem
            key="photos"
            leading={<StarIcon />}
            childItems={[
              <ListItem key="trips">Trips</ListItem>,
              <ListItem key="family">Family</ListItem>,
            ]}
          >
            Photos
          </ListItem>
          <ListItem
            key="documents"
            leading={<FeedIcon />}
            childItems={[
              <ListItem key="taxes">Taxes</ListItem>,
              <ListItem key="letters">Letters</ListItem>,
            ]}
          >
            Documents
          </ListItem>
          <ListItem key="music" leading={<HomeIcon />}>
            Music
          </ListItem>
        </List>
      </div>
    );
  },
};

/** Link items: real anchors, each a Tab stop; `current` marks the page being shown. */
export const Links: Story = {
  render: ({ variant }) => (
    <div
      className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
      data-testid="links"
    >
      <List aria-label="Settings" variant={variant}>
        <ListItem
          key="profile"
          href="#profile"
          current
          leading={<HomeIcon />}
          supportingText="Name, photos and bio"
        >
          Profile
        </ListItem>
        <ListItem key="notifications" href="#notifications" leading={<SendIcon />}>
          Notifications
        </ListItem>
        <ListItem key="about" href="#about" leading={<StarIcon />} disabled>
          About
        </ListItem>
      </List>
    </div>
  ),
};

/** Switch and checkbox items: the whole item toggles; checked items take the selected colours. */
export const Toggles: Story = {
  render: function TogglesStory({ variant }) {
    const [searchable, setSearchable] = useState(true);
    return (
      <div
        className="flex w-[360px] flex-col gap-3 rounded-corner-extra-large bg-surface-container p-3"
        data-testid="toggles"
      >
        <List aria-label="Privacy" variant={variant}>
          <ListItem
            key="search"
            control="switch"
            checked={searchable}
            onCheckedChange={setSearchable}
            supportingText="Search engines can list your profile"
          >
            Show my profile in search engines
          </ListItem>
          <ListItem key="online" control="switch" leading={<StarIcon />}>
            Show when I&apos;m online
          </ListItem>
          <ListItem key="read" control="switch" switchIcons disabled>
            Read receipts
          </ListItem>
        </List>
        <List aria-label="Notify me about" variant={variant}>
          <ListItem key="messages" control="checkbox" defaultChecked>
            Messages
          </ListItem>
          <ListItem key="offers" control="checkbox" supportingText="Price drops and new offers">
            Offers
          </ListItem>
        </List>
      </div>
    );
  },
};

/** A radio list: one Tab stop, ↑ / ↓ choose; the chosen item takes the selected colours. */
export const RadioList: Story = {
  render: function RadioListStory({ variant }) {
    const [theme, setTheme] = useState('dark');
    return (
      <div
        className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
        data-testid="radio-list"
      >
        <List aria-label="Theme" variant={variant} value={theme} onValueChange={setTheme}>
          <ListItem key="light" value="light">
            Light
          </ListItem>
          <ListItem key="dark" value="dark" supportingText="Easier on the eyes at night">
            Dark
          </ListItem>
          <ListItem key="system" value="system">
            Match my device
          </ListItem>
        </List>
      </div>
    );
  },
};

/** A flat colour picture with a sun, as a stand-in photo. */
const picture = (colour: string, width = 300, height = 300) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${colour}"/><circle cx="${width * 0.7}" cy="${height * 0.3}" r="${height * 0.14}" fill="#fff8"/></svg>`,
  )}`;

/** M3's leading media: images, a fallback, a broken image, video thumbnails, disabled. */
export const Media: Story = {
  render: ({ variant }) => (
    <div
      className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
      data-testid="media"
    >
      <List aria-label="Saved" variant={variant} onAction={() => {}}>
        <ListItem
          key="soup"
          leading={<ListItemImage src={picture('#d9a066')} alt="" />}
          supportingText="Saved yesterday"
        >
          Tomato soup
        </ListItem>
        <ListItem
          key="note"
          leading={<ListItemImage alt="" fallback={<FeedIcon />} />}
          supportingText="No photo"
        >
          Shopping list
        </ListItem>
        <ListItem
          key="broken"
          leading={<ListItemImage src="/does-not-exist.png" alt="" fallback={<FeedIcon />} />}
          supportingText="Its photo failed to load"
        >
          Garden plan
        </ListItem>
        <ListItem
          key="video"
          leading={<ListItemVideo src={picture('#7aa6c2', 400, 225)} alt="" duration="2:41" />}
          supportingText="Cooking · 12k views"
        >
          How to make pancakes
        </ListItem>
        <ListItem
          key="large"
          overline="Workshop"
          leading={
            <ListItemVideo src={picture('#a3b18a', 456, 256)} alt="" size="lg" duration="14:05" />
          }
          supportingText="A longer video with a three-line item, aligned to the top"
        >
          Building a bookshelf
        </ListItem>
        <ListItem
          key="disabled"
          disabled
          leading={<ListItemImage src={picture('#c9a0dc')} alt="" />}
          supportingText="Unavailable"
        >
          Lavender cake
        </ListItem>
      </List>
    </div>
  ),
};

/** Standard lists with full and inset dividers, and line limits with rounded media. */
export const DividersAndLines: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-4 bg-surface p-3" data-testid="dividers">
      <List aria-label="Account" dividers="full">
        <ListItem key="profile" leading={<HomeIcon />}>
          Profile
        </ListItem>
        <ListItem key="search" leading={<SearchIcon />}>
          Search history
        </ListItem>
        <ListItem key="delete" leading={<DeleteIcon />}>
          Recently deleted
        </ListItem>
      </List>
      <List
        aria-label="Recently deleted"
        dividers="inset"
        headlineLines={2}
        supportingTextLines={1}
        classNames={{ media: 'rounded-corner-medium' }}
      >
        <ListItem
          key="a"
          leading={<ListItemImage src={picture('#d9a066')} alt="" />}
          supportingText="Deleted 3 days ago · 27 days left before it's gone for good"
        >
          A post with a long title that runs past two lines, so it ends with an ellipsis here
        </ListItem>
        <ListItem
          key="b"
          leading={<ListItemImage alt="" fallback={<FeedIcon />} />}
          supportingText="Deleted today"
        >
          Words only
        </ListItem>
      </List>
    </div>
  ),
};

/**
 * Sections: each `ListSection` is a labelled group under a subheader. Items take their
 * corners within their section, and ↑ / ↓ move across sections as through one list.
 */
export const Sections: StoryObj<Args & { kind: 'static' | 'action' | 'selection' }> = {
  args: { kind: 'action' },
  argTypes: { kind: { control: 'inline-radio', options: ['static', 'action', 'selection'] } },
  render: function SectionsStory({ variant, kind }) {
    const [action, setAction] = useState('');
    return (
      <div
        className="w-[360px] rounded-corner-extra-large bg-surface-container p-3"
        data-testid="sections"
      >
        <List
          aria-label="Settings"
          variant={variant}
          {...(kind === 'action' && { onAction: (key) => setAction(String(key)) })}
          {...(kind === 'selection' && {
            selectionMode: 'multiple' as const,
            defaultSelectedKeys: ['wifi'],
          })}
        >
          <ListSection key="network" title="Network">
            <ListItem key="wifi" leading={<HomeIcon />} supportingText="Connected">
              Wi‑Fi
            </ListItem>
            <ListItem key="bluetooth" leading={<SendIcon />}>
              Bluetooth
            </ListItem>
          </ListSection>
          <ListSection key="display" title="Display">
            <ListItem key="brightness" leading={<StarIcon />}>
              Brightness
            </ListItem>
            <ListItem key="font" leading={<SearchIcon />} supportingText="Default">
              Font size
            </ListItem>
          </ListSection>
        </List>
        <p className="sr-only" data-testid="action">
          {action}
        </p>
      </div>
    );
  },
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
        <List
          aria-label="Actions"
          variant="segmented"
          data-testid="target"
          style={{ width: 360 }}
          className={LAYOUT_OVERRIDES[override]}
          onAction={() => setCount((c) => c + 1)}
        >
          <ListItem key="search" leading={<SearchIcon />}>
            Search
          </ListItem>
          <ListItem key="star" leading={<StarIcon />}>
            Star
          </ListItem>
        </List>
      </div>
    );
  },
};

/**
 * Web density, 0 to -3 (M3: a list "can adjust margins, spacing, or density"): each step takes
 * 2px off the padding above and below an item and 4px off its height (one line 56 → 44px, two
 * 72 → 60px, three 88 → 76px; items with media too) and off section subheaders. Items are
 * stacked rows, so dense ones keep full-row targets that never overlap.
 */
export const Density: Story = {
  render: function DensityStory({ variant }) {
    return (
      <DensityColumns>
        {(density) => (
          <div className="flex w-full flex-col gap-3 rounded-corner-extra-large bg-surface-container p-2">
            <List
              aria-label="Contacts"
              variant={variant}
              density={density}
              onAction={() => {}}
              data-testid={`${density}-lines`}
            >
              <ListItem key="one" leading={<StarIcon />} trailing={<SendIcon />}>
                Alex Moreau
              </ListItem>
              <ListItem key="two" leading={<ListItemAvatar>S</ListItemAvatar>} supportingText="Sam">
                Design review
              </ListItem>
              <ListItem
                key="three"
                overline="Today"
                supportingText="Notes and next steps"
                trailing="9:30"
              >
                Planning
              </ListItem>
              <ListItem
                key="image"
                leading={<ListItemImage src={picture('#d9a066')} alt="" />}
                supportingText="Saved yesterday"
              >
                Phở
              </ListItem>
            </List>
            <List
              aria-label="Folders"
              variant={variant}
              density={density}
              defaultExpandedKeys={['photos']}
              data-testid={`${density}-nested`}
            >
              <ListItem
                key="photos"
                leading={<FeedIcon />}
                childItems={[
                  <ListItem key="trips">Trips</ListItem>,
                  <ListItem key="family">Family</ListItem>,
                ]}
              >
                Photos
              </ListItem>
              <ListItem key="music" leading={<HomeIcon />}>
                Music
              </ListItem>
            </List>
            <List aria-label="Settings" density={density} data-testid={`${density}-sections`}>
              <ListSection key="privacy" title="Privacy">
                <ListItem key="search" control="switch" defaultChecked>
                  Profile in search
                </ListItem>
                <ListItem key="receipts" control="checkbox">
                  Read receipts
                </ListItem>
              </ListSection>
            </List>
          </div>
        )}
      </DensityColumns>
    );
  },
};
