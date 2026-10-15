import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Switch } from '../switch/Switch';
import type { ReactElement } from 'react';
import { List, ListItem, type ListItemProps } from './List';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('List (static)', () => {
  it('renders a plain list with Compose padding, lines and colours', async () => {
    const { container } = render(
      <List aria-label="Contacts" data-testid="list" className="w-80">
        <ListItem key="a" leading={<Icon />}>
          Alice
        </ListItem>
        <ListItem key="b" supportingText="Online">
          Bob
        </ListItem>
        <ListItem key="c" overline="Work" supportingText="Busy" trailing="9:41">
          Carol
        </ListItem>
      </List>,
    );
    const list = screen.getByRole('list', { name: 'Contacts' });
    expect(list).toBe(screen.getByTestId('list'));
    expect(list).toHaveClass('w-80', 'flex-col');
    const [one, two, three] = screen.getAllByRole('listitem') as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    expect(one).toHaveClass(
      'ps-[16px]',
      'pe-[16px]',
      'pt-[calc(10px+var(--md-sys-density,0)*2px)]',
      'pb-[calc(10px+var(--md-sys-density,0)*2px)]',
      'min-h-[calc(56px+var(--md-sys-density,0)*4px)]',
      'bg-[var(--_md-comp-list-container-color)]',
    );
    expect(list).toHaveAttribute('data-tokens', 'md-comp-list');
    expect(list).toHaveAttribute('data-variant', 'standard');
    expect(one).toHaveAttribute('data-tokens', 'md-comp-list');
    expect(one).toHaveAttribute('data-variant', 'standard');
    expect(two).toHaveClass('min-h-[calc(72px+var(--md-sys-density,0)*4px)]', 'items-center');
    expect(three).toHaveClass('min-h-[calc(88px+var(--md-sys-density,0)*4px)]', 'items-start');
    expect(one).not.toHaveClass('state-layer');
    expect(within(one).getByText('Alice')).toHaveClass(
      'text-body-large',
      'text-[color:var(--_md-comp-list-list-item-label-text-color)]',
    );
    expect(within(two).getByText('Online')).toHaveClass(
      'text-body-medium',
      'text-[color:var(--_md-comp-list-list-item-supporting-text-color)]',
    );
    expect(within(three).getByText('Work')).toHaveClass('text-label-small');
    expect(within(three).getByText('9:41')).toHaveClass('text-label-small', 'col-start-3');
    expect(screen.getByTestId('icon').parentElement).toHaveClass(
      'text-[color:var(--_md-comp-list-list-item-leading-icon-color)]',
      'col-start-1',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('keeps the 12px gaps beside leading and trailing content only when they are there', () => {
    render(
      <List aria-label="Contacts">
        <ListItem key="a" leading={<Icon />} trailing="9:41">
          Alice
        </ListItem>
        <ListItem key="b">Bob</ListItem>
      </List>,
    );
    const [alice, bob] = screen.getAllByRole('listitem') as [HTMLElement, HTMLElement];
    // The grid has no column gap: empty columns would keep theirs (M3: a text-only item's
    // label is 16px from each side).
    const cell = within(alice).getByText('Alice').parentElement!.parentElement!;
    expect(cell.className).not.toMatch(/(^| )gap-x-/);
    expect(screen.getByTestId('icon').parentElement).toHaveClass('me-[12px]');
    expect(within(alice).getByText('9:41')).toHaveClass('ms-[12px]');
    expect(within(bob).getByText('Bob').parentElement!.parentElement!.children).toHaveLength(1);
  });

  it('separates segmented items by 2px and marks their position', () => {
    render(
      <List aria-label="Settings" variant="segmented">
        <ListItem key="a">A</ListItem>
        <ListItem key="b">B</ListItem>
        <ListItem key="c">C</ListItem>
      </List>,
    );
    expect(screen.getByRole('list')).toHaveClass('gap-[2px]');
    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.dataset.position)).toEqual(['first', 'middle', 'last']);
    expect(items[0]).toHaveClass('data-[shape=rest]:data-[position=first]:rounded-t-corner-large');
  });
});

describe('List (server-sent items)', () => {
  it("keeps items that arrive as lazy elements, as a server component's can", () => {
    // How React's server payload hands over an element it hasn't inlined.
    const lazy = (element: ReactElement) =>
      ({
        $$typeof: Symbol.for('react.lazy'),
        _payload: element,
        _init: (payload: ReactElement) => payload,
      }) as unknown as ReactElement<ListItemProps>;
    render(
      <List aria-label="Settings" disabledKeys={['b']}>
        {[lazy(<ListItem key="a">General</ListItem>), lazy(<ListItem key="b">Privacy</ListItem>)]}
      </List>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('General')).toBeInTheDocument();
  });
});

describe('List (interactive)', () => {
  // 2026-10-15: React Aria centred a list taller than the window on every arrow key, a
  // 200px jump; the root asks for the nearest position instead.
  it('reveals rows at the nearest position, so arrow keys never centre the page on the list', () => {
    const scrollIntoView = vi.fn();
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    for (const selectionMode of [undefined, 'single'] as const) {
      const { unmount } = render(
        <List
          aria-label="Mail"
          onAction={selectionMode ? undefined : () => {}}
          selectionMode={selectionMode}
        >
          <ListItem key="inbox">Inbox</ListItem>
          <ListItem key="sent">Sent</ListItem>
        </List>,
      );
      const root = screen.getByRole(selectionMode ? 'listbox' : 'grid', { name: 'Mail' });
      // React Aria's call when keyboard focus moves within a root that isn't wholly on screen.
      root.scrollIntoView({ block: 'center', inline: 'center' });
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest', inline: 'nearest' });
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(root);
      unmount();
    }
    if (original) Object.defineProperty(Element.prototype, 'scrollIntoView', original);
    else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('is a grid list whose items act, with state layers and shape states', async () => {
    const onAction = vi.fn();
    const { container } = render(
      <List aria-label="Mail" onAction={onAction} variant="segmented">
        <ListItem key="inbox" supportingText="3 new">
          Inbox
        </ListItem>
        <ListItem key="sent">Sent</ListItem>
      </List>,
    );
    const grid = screen.getByRole('grid', { name: 'Mail' });
    const [inbox, sent] = within(grid).getAllByRole('row') as [HTMLElement, HTMLElement];
    expect(inbox).toHaveClass(
      'state-layer',
      'focus-ring-inset',
      'data-[shape=rest]:rounded-corner-extra-small',
      'data-[shape=hovered]:rounded-corner-medium',
      'data-[shape=active]:rounded-corner-large',
    );
    expect(inbox).toHaveAttribute('data-shape', 'rest');
    expect(inbox).toHaveAttribute('data-position', 'first');
    await userEvent.click(inbox);
    expect(onAction).toHaveBeenCalledWith('inbox');
    await userEvent.keyboard('{ArrowDown}');
    expect(sent).toHaveFocus();
    expect(sent).toHaveAttribute('data-shape', 'active');
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith('sent');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is a list box of options when it selects, with a check besides the colour', async () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <List
        aria-label="Labels"
        selectionMode="multiple"
        defaultSelectedKeys={['work']}
        onSelectionChange={onSelectionChange}
      >
        <ListItem key="work">Work</ListItem>
        <ListItem key="home">Home</ListItem>
      </List>,
    );
    const listbox = screen.getByRole('listbox', { name: 'Labels' });
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    const [work, home] = within(listbox).getAllByRole('option') as [HTMLElement, HTMLElement];
    expect(work).toHaveAccessibleName('Work');
    expect(work).toHaveAttribute('aria-selected', 'true');
    expect(work).toHaveAttribute('data-selected', 'true');
    expect(work).toHaveAttribute('data-shape', 'active');
    expect(work).toHaveClass(
      'data-selected:bg-[var(--_md-comp-list-list-item-selected-container-color)]',
    );
    expect(within(work).getByText('Work')).toHaveClass(
      'group-data-selected/list-item:text-on-secondary-container',
    );
    expect(work.querySelector('[data-selection-indicator]')).toHaveClass(
      'opacity-0',
      'group-data-selected/list-item:opacity-100',
      'size-[20px]',
    );
    await userEvent.click(home);
    expect(onSelectionChange).toHaveBeenCalled();
    expect(home).toHaveAttribute('aria-selected', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('can leave out the selection check, and keeps a grid list when items also act', () => {
    render(
      <>
        <List aria-label="Sizes" selectionMode="single" selectionIndicator={false}>
          <ListItem key="s">Small</ListItem>
        </List>
        <List aria-label="Files" selectionMode="multiple" onAction={() => {}}>
          <ListItem key="a">Report</ListItem>
        </List>
      </>,
    );
    expect(screen.getByRole('option').querySelector('[data-selection-indicator]')).toBeNull();
    expect(screen.getByRole('grid', { name: 'Files' })).toBeInTheDocument();
    expect(screen.getByRole('row').querySelector('[data-selection-indicator]')).not.toBeNull();
  });

  it('wraps the arrow keys at the ends', async () => {
    render(
      <>
        <List aria-label="Mail" onAction={() => {}}>
          <ListItem key="inbox">Inbox</ListItem>
          <ListItem key="sent">Sent</ListItem>
        </List>
        <List aria-label="Sort" selectionMode="single">
          <ListItem key="new">Newest</ListItem>
          <ListItem key="old">Oldest</ListItem>
        </List>
      </>,
    );
    const [inbox, sent] = screen.getAllByRole('row') as [HTMLElement, HTMLElement];
    inbox.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(sent).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(inbox).toHaveFocus();
    const [newest, oldest] = screen.getAllByRole('option') as [HTMLElement, HTMLElement];
    newest.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(oldest).toHaveFocus();
  });

  it('lets ← / → reach a trailing control and disables items', async () => {
    render(
      <List aria-label="Settings" onAction={() => {}} disabledKeys={['b']}>
        <ListItem key="a" trailing={<Switch aria-label="Wi-Fi on" />}>
          Wi-Fi
        </ListItem>
        <ListItem key="b">Bluetooth</ListItem>
      </List>,
    );
    const [wifi, bluetooth] = screen.getAllByRole('row') as [HTMLElement, HTMLElement];
    expect(bluetooth).toHaveAttribute('data-disabled');
    await userEvent.tab();
    expect(wifi).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('switch', { name: 'Wi-Fi on' })).toHaveFocus();
  });

  it('keeps link items in a list with onAction as grid rows', () => {
    render(
      <List aria-label="Pages" onAction={() => {}}>
        <ListItem key="home" href="/home">
          Home
        </ListItem>
      </List>,
    );
    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('requires a name in its types', () => {
    const unnamed = (
      // @ts-expect-error aria-label or aria-labelledby is required
      <List>
        <ListItem key="a">A</ListItem>
      </List>
    );
    expect(unnamed).toBeTruthy();
  });
});

describe('List (switch and checkbox items)', () => {
  it('makes the whole item one switch, named by its headline and described by the rest', async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <List variant="segmented" aria-label="Privacy">
        <ListItem
          key="search"
          control="switch"
          defaultChecked
          onCheckedChange={onCheckedChange}
          supportingText="Search engines can list you"
        >
          Show my profile in search engines
        </ListItem>
        <ListItem key="online" control="switch">
          Show when I'm online
        </ListItem>
      </List>,
    );
    expect(screen.getByRole('list', { name: 'Privacy' })).toBeInTheDocument();
    const search = screen.getByRole('switch', { name: 'Show my profile in search engines' });
    expect(search).toBeChecked();
    expect(search).toHaveAccessibleDescription('Search engines can list you');
    // One control per item: the drawn switch is hidden from assistive tech.
    expect(screen.getAllByRole('switch')).toHaveLength(2);

    const item = search.closest('label') as HTMLElement;
    expect(item).toHaveAttribute('data-selected', 'true');
    expect(item).toHaveAttribute('data-shape', 'active');
    expect(item).toHaveAttribute('data-position', 'first');
    expect(item).toHaveAttribute('data-variant', 'segmented');
    expect(item).toHaveClass(
      'data-selected:bg-[var(--_md-comp-list-list-item-selected-container-color)]',
      'state-layer',
      'bg-[var(--_md-comp-list-container-color)]',
    );

    // Pressing anywhere on the item toggles it.
    await userEvent.click(within(item).getByText('Search engines can list you'));
    expect(search).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    // Off, with the pointer still over it: the hovered shape.
    expect(item).toHaveAttribute('data-shape', 'hovered');

    // Space toggles from the keyboard, and the focused item takes the focused shape.
    act(() => search.blur());
    await userEvent.tab();
    expect(search).toHaveFocus();
    expect(item).toHaveAttribute('data-focus-visible', 'true');
    await userEvent.keyboard(' ');
    expect(search).toBeChecked();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('places the switch at the end and checkboxes at the start, unless told otherwise', () => {
    render(
      <List aria-label="Options">
        <ListItem key="a" control="switch">
          Wi-Fi
        </ListItem>
        <ListItem key="b" control="checkbox">
          Alice
        </ListItem>
        <ListItem key="c" control="checkbox" controlPlacement="trailing">
          Bob
        </ListItem>
      </List>,
    );
    const drawn = (name: string) =>
      (
        screen
          .getByRole(name === 'Wi-Fi' ? 'switch' : 'checkbox', { name })
          .closest('label') as HTMLElement
      ).querySelector('[aria-hidden="true"].group\\/control') as HTMLElement;
    expect(drawn('Wi-Fi').parentElement).toHaveClass('col-start-3');
    expect(drawn('Alice').parentElement).toHaveClass('col-start-1');
    expect(drawn('Bob').parentElement).toHaveClass('col-start-3');
  });

  it('is controlled, disables items and posts with a form', async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <form>
        <List aria-label="Filters" disabled={false}>
          <ListItem
            key="a"
            control="checkbox"
            checked={false}
            onCheckedChange={onCheckedChange}
            name="type"
            value="cars"
          >
            Cars
          </ListItem>
          <ListItem key="b" control="checkbox" disabled name="type" value="boats">
            Boats
          </ListItem>
        </List>
      </form>,
    );
    const cars = screen.getByRole('checkbox', { name: 'Cars' });
    await userEvent.click(cars.closest('label') as HTMLElement);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(cars).not.toBeChecked();

    const boats = screen.getByRole('checkbox', { name: 'Boats' });
    expect(boats).toBeDisabled();
    expect(boats.closest('label')).toHaveAttribute('data-disabled', 'true');
    expect(container.querySelector('input[name="type"][value="cars"]')).toBe(cars);
  });

  it("refuses switch items in a list with onAction, so a row isn't two controls", () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <List aria-label="Settings" onAction={() => {}}>
          <ListItem key="a" control="switch">
            Wi-Fi
          </ListItem>
        </List>,
      ),
    ).toThrow(/can't be in a list with onAction/);
    vi.restoreAllMocks();
  });
});

describe('List (radio lists)', () => {
  it('is a radio group of items with one Tab stop, and arrow keys choose', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <>
        <button type="button">Before</button>
        <List
          variant="segmented"
          aria-label="Theme"
          defaultValue="dark"
          onValueChange={onValueChange}
        >
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
      </>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument();
    const dark = screen.getByRole('radio', { name: 'Dark' });
    expect(dark).toBeChecked();
    expect(dark).toHaveAccessibleDescription('Easier on the eyes at night');
    expect(dark.closest('label')).toHaveAttribute('data-selected', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(dark).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const system = screen.getByRole('radio', { name: 'Match my device' });
    expect(system).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('system');

    await userEvent.click(screen.getByText('Light'));
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(system.closest('label')).not.toHaveAttribute('data-selected');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is controlled, places radios at the end when asked, and disables items', async () => {
    const onValueChange = vi.fn();
    render(
      <List
        aria-label="Language"
        value="en"
        onValueChange={onValueChange}
        controlPlacement="trailing"
        name="locale"
      >
        <ListItem key="en" value="en">
          English
        </ListItem>
        <ListItem key="de" value="de">
          Deutsch
        </ListItem>
        <ListItem key="fr" value="fr" disabled>
          Français
        </ListItem>
      </List>,
    );
    const de = screen.getByRole('radio', { name: 'Deutsch' });
    await userEvent.click(de);
    expect(onValueChange).toHaveBeenCalledWith('de');
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(de).toHaveAttribute('name', 'locale');
    expect(screen.getByRole('radio', { name: 'Français' })).toBeDisabled();
    const ring = (de.closest('label') as HTMLElement).querySelector('.group\\/control');
    expect(ring?.parentElement).toHaveClass('col-start-3');
  });

  it('needs a value on every item', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <List aria-label="Theme" defaultValue="a">
          <ListItem key="a">A</ListItem>
        </List>,
      ),
    ).toThrow(/needs a value/);
    vi.restoreAllMocks();
  });
});

describe('List (item options)', () => {
  it('aligns content to the top or centre when asked', () => {
    render(
      <List aria-label="Messages">
        <ListItem key="a" overline="Work" supportingText="Lunch?" verticalAlignment="center">
          Carol
        </ListItem>
        <ListItem key="b" verticalAlignment="top">
          Dan
        </ListItem>
      </List>,
    );
    const [carol, dan] = screen.getAllByRole('listitem') as [HTMLElement, HTMLElement];
    expect(carol).toHaveClass('items-center');
    expect(carol).not.toHaveClass('items-start');
    expect(dan).toHaveClass('items-start');
    expect(dan).not.toHaveClass('items-center');
  });

  it('disables single items of an interactive list, or all of them', () => {
    const { rerender } = render(
      <List aria-label="Pages" onAction={() => {}}>
        <ListItem key="a">A</ListItem>
        <ListItem key="b" disabled>
          B
        </ListItem>
      </List>,
    );
    let [a, b] = screen.getAllByRole('row') as [HTMLElement, HTMLElement];
    expect(a).not.toHaveAttribute('data-disabled');
    expect(b).toHaveAttribute('data-disabled');
    rerender(
      <List aria-label="Pages" onAction={() => {}} disabled>
        <ListItem key="a">A</ListItem>
        <ListItem key="b">B</ListItem>
      </List>,
    );
    [a, b] = screen.getAllByRole('row') as [HTMLElement, HTMLElement];
    expect(a).toHaveAttribute('data-disabled');
    expect(b).toHaveAttribute('data-disabled');
  });
});

describe('List (link items)', () => {
  it('renders each link item as a real anchor in a plain list, routed on a plain click', async () => {
    const navigate = vi.fn();
    const { container } = render(
      <RouterProvider navigate={navigate}>
        <List variant="segmented" aria-label="Settings">
          <ListItem key="profile" href="/settings" current supportingText="Name and photos">
            Profile
          </ListItem>
          <ListItem key="account" href="/settings/account">
            Account
          </ListItem>
          <ListItem key="terms" href="/legal/terms" disabled>
            Terms of service
          </ListItem>
        </List>
      </RouterProvider>,
    );
    expect(screen.getByRole('list', { name: 'Settings' }).tagName).toBe('UL');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    const profile = screen.getByRole('link', { name: 'Profile' });
    expect(profile.tagName).toBe('A');
    expect(profile).toHaveAttribute('href', '/settings');
    expect(profile).toHaveAccessibleDescription('Name and photos');
    expect(profile).toHaveAttribute('aria-current', 'page');
    const item = profile.closest('li') as HTMLElement;
    expect(item).toHaveAttribute('data-selected', 'true');
    expect(item).toHaveAttribute('data-shape', 'active');
    expect(item).toHaveAttribute('data-position', 'first');
    expect(item).toHaveAttribute('data-variant', 'segmented');
    expect(item).toHaveClass(
      'state-layer',
      'data-selected:bg-[var(--_md-comp-list-list-item-selected-container-color)]',
      'bg-[var(--_md-comp-list-container-color)]',
    );

    const account = screen.getByRole('link', { name: 'Account' });
    expect(account).not.toHaveAttribute('aria-current');

    // Each link is its own Tab stop, and Enter follows it through the router.
    await userEvent.tab();
    expect(profile).toHaveFocus();
    await userEvent.tab();
    expect(account).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(navigate).toHaveBeenLastCalledWith('/settings/account', undefined);
    await userEvent.click(profile);
    expect(navigate).toHaveBeenLastCalledWith('/settings', undefined);

    // A disabled link item has no href, so it isn't a link at all.
    const terms = screen.getByText('Terms of service').closest('a') as HTMLElement;
    expect(terms).not.toHaveAttribute('href');
    expect(terms).toHaveAttribute('aria-disabled', 'true');
    expect(terms.closest('li')).toHaveAttribute('data-disabled', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('moves between links with the arrow keys, wrapping, and Home / End', async () => {
    render(
      <List aria-label="Settings">
        <ListItem key="profile" href="/settings">
          Profile
        </ListItem>
        <ListItem key="terms" href="/legal/terms" disabled>
          Terms of service
        </ListItem>
        <ListItem key="account" href="/settings/account" trailing={<button>Help</button>}>
          Account
        </ListItem>
        <ListItem key="privacy" href="/settings/privacy">
          Privacy
        </ListItem>
      </List>,
    );
    const [profile, account, privacy] = ['Profile', 'Account', 'Privacy'].map((name) =>
      screen.getByRole('link', { name }),
    ) as [HTMLElement, HTMLElement, HTMLElement];
    profile.focus();
    // The disabled item has no link, so ↓ skips it.
    await userEvent.keyboard('{ArrowDown}');
    expect(account).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(profile).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(privacy).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(profile).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(privacy).toHaveFocus();
    // A control in an item keeps its keys, and Tab still visits every link.
    screen.getByRole('button', { name: 'Help' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus();
    profile.focus();
    await userEvent.tab();
    expect(account).toHaveFocus();
  });

  it('takes disabledKeys and the list-wide disabled', () => {
    const { rerender } = render(
      <List aria-label="Pages" disabledKeys={['b']}>
        <ListItem key="a" href="/a">
          A
        </ListItem>
        <ListItem key="b" href="/b">
          B
        </ListItem>
      </List>,
    );
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/a');
    expect(screen.getByText('B').closest('a')).not.toHaveAttribute('href');
    rerender(
      <List aria-label="Pages" disabled>
        <ListItem key="a" href="/a">
          A
        </ListItem>
      </List>,
    );
    expect(screen.getByText('A').closest('a')).not.toHaveAttribute('href');
  });

  it('opens new tabs safely, downloads, and leaves modified clicks to the browser', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <List aria-label="Links">
          <ListItem key="help" href="https://example.com/help" target="_blank">
            Help
          </ListItem>
          <ListItem key="report" href="/report.pdf" download="report.pdf">
            Report
          </ListItem>
          <ListItem key="home" href="/home">
            Home
          </ListItem>
        </List>
      </RouterProvider>,
    );
    const help = screen.getByRole('link', { name: 'Help' });
    expect(help).toHaveAttribute('target', '_blank');
    expect(help).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: 'Report' })).toHaveAttribute('download', 'report.pdf');
    // Ctrl, as jsdom isn't a Mac (React Aria reads ⌘ there): a new tab, not the router.
    const user = userEvent.setup();
    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('link', { name: 'Home' }));
    await user.keyboard('{/Control}');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('keeps buttons in the trailing content out of the link', async () => {
    const navigate = vi.fn();
    const onConfirm = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <List aria-label="Requests">
          <ListItem
            key="priya"
            href="/@priya"
            supportingText="Wants to be friends"
            trailing={
              <button type="button" onClick={onConfirm}>
                Confirm
              </button>
            }
          >
            Priya Shah
          </ListItem>
        </List>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Priya Shah' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(link).not.toContainElement(confirm);
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    // The link, then the button: each its own Tab stop; the button's focus isn't the item's.
    act(() => confirm.blur());
    await userEvent.tab();
    expect(link).toHaveFocus();
    expect(link.closest('li')).toHaveAttribute('data-focus-visible', 'true');
    await userEvent.tab();
    expect(confirm).toHaveFocus();
    expect(link.closest('li')).not.toHaveAttribute('data-focus-visible');
  });
});

describe('List (expandable items)', () => {
  const folders = (props: Partial<Parameters<typeof List>[0]> = {}) => (
    <List aria-label="Folders" {...props}>
      <ListItem
        key="photos"
        supportingText="3 albums"
        childItems={[
          <ListItem key="trips">Trips</ListItem>,
          <ListItem key="family">Family</ListItem>,
        ]}
      >
        Photos
      </ListItem>
      <ListItem key="music">Music</ListItem>
    </List>
  );

  it('expands and collapses an item with nested items, with a chevron and the arrow keys', async () => {
    const onExpandedChange = vi.fn();
    const { container } = render(folders({ onExpandedChange }));
    const tree = screen.getByRole('treegrid', { name: 'Folders' });
    const photos = within(tree).getAllByRole('row')[0]!;
    expect(photos).toHaveAttribute('aria-expanded', 'false');
    expect(photos).toHaveAttribute('aria-level', '1');
    expect(screen.queryByText('Trips')).toBeNull();
    const chevron = within(photos).getByRole('button', { name: /expand/i });
    expect(chevron).toHaveAttribute('tabindex', '-1');
    expect(chevron.querySelector('[data-touch-target]')).not.toBeNull();

    await userEvent.click(photos);
    expect(photos).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(['photos']));
    const trips = screen.getByRole('row', { name: 'Trips' });
    expect(trips).toHaveAttribute('aria-level', '2');
    expect(trips).toHaveAttribute('aria-posinset', '1');
    expect(trips).toHaveAttribute('aria-setsize', '2');
    expect(screen.getByRole('row', { name: 'Family' })).toHaveAttribute('aria-posinset', '2');
    expect(screen.getByRole('row', { name: 'Music' })).toHaveAttribute('aria-posinset', '2');
    expect(screen.getByRole('row', { name: 'Music' })).toHaveAttribute('aria-setsize', '2');
    expect(trips).toHaveClass('ps-[calc(16px+var(--m3-list-level,0)*16px)]');
    expect(trips.style.getPropertyValue('--m3-list-level')).toBe('1');
    expect(await axeViolations(container)).toEqual([]);

    photos.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(photos).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowRight}');
    expect(photos).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(chevron);
    expect(photos).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens nested items in, and keeps leaving ones (hidden) until they have closed', async () => {
    render(folders());
    const photos = screen.getAllByRole('row')[0]!;
    const reveal = (row: HTMLElement) => row.parentElement!.parentElement!;
    // Rows there from the start don't open in; rows added later do.
    expect(reveal(photos)).not.toHaveAttribute('data-appear');
    expect(reveal(photos)).toHaveClass(
      'grid-rows-[1fr]',
      // The height moves only with motion; under reduced motion rows fade where they are.
      'motion-safe:data-appear:starting:grid-rows-[0fr]',
      'motion-safe:data-exiting:grid-rows-[0fr]',
      'data-exiting:opacity-0',
      'motion-reduce:[transition-property:opacity]',
    );
    await userEvent.click(photos);
    const trips = screen.getByRole('row', { name: 'Trips' });
    expect(reveal(trips)).toHaveAttribute('data-appear');

    // jsdom runs no transitions; stand in for the closing ones.
    let finish = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    for (const name of ['Trips', 'Family']) {
      reveal(screen.getByRole('row', { name })).getAnimations = () =>
        [{ finished }] as unknown as Animation[];
    }
    await userEvent.click(photos);
    expect(screen.queryByRole('row', { name: 'Trips' })).toBeNull();
    const leaving = screen.getByText('Trips').closest('[data-exiting]') as HTMLElement;
    expect(leaving).toHaveAttribute('inert');
    expect(leaving.querySelector('[aria-hidden="true"]')).toHaveTextContent('Trips');
    await act(async () => {
      finish();
      await finished;
    });
    expect(screen.queryByText('Trips')).toBeNull();
  });

  it('is controlled with expandedKeys, and keeps acting on items with onAction', async () => {
    const onAction = vi.fn();
    render(folders({ expandedKeys: ['photos'], onAction }));
    expect(screen.getByRole('row', { name: 'Trips' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('row', { name: 'Trips' }));
    expect(onAction).toHaveBeenCalledWith('trips');
  });
});

describe('List accessibility tree', () => {
  it("reads a control item's text once: as the input's name and description", () => {
    render(
      <List aria-label="Theme" defaultValue="dark">
        <ListItem key="light" value="light">
          Light
        </ListItem>
        <ListItem key="dark" value="dark" supportingText="Easier at night">
          Dark
        </ListItem>
      </List>,
    );
    const dark = screen.getByRole('radio', { name: 'Dark' });
    expect(dark).toHaveAccessibleDescription('Easier at night');
    // The visible text is hidden, so it isn't read again after the radio.
    expect(screen.getByText('Dark').closest('[aria-hidden="true"]')).not.toBe(null);
    expect(screen.getByText('Easier at night').closest('[aria-hidden="true"]')).not.toBe(null);
  });

  it('hides decorative icons and the chevron, keeping named ones', async () => {
    render(
      <List aria-label="Folders" defaultExpandedKeys={['photos']}>
        <ListItem
          key="photos"
          leading={<Icon />}
          trailing={<svg aria-label="Shared" viewBox="0 0 24 24" />}
          childItems={[<ListItem key="trips">Trips</ListItem>]}
        >
          Photos
        </ListItem>
      </List>,
    );
    const row = screen.getByRole('row', { name: /Photos/ });
    expect(within(row).getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
    expect(within(row).getByLabelText('Shared')).not.toHaveAttribute('aria-hidden');
    const chevron = within(row).getByRole('button', { name: /Collapse/ });
    expect(chevron.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('List component tokens', () => {
  it('lets consumer item classes replace the token classes', () => {
    render(
      <List aria-label="People" variant="segmented" classNames={{ item: 'bg-tertiary' }}>
        <ListItem key="alex">Alex</ListItem>
      </List>,
    );
    expect(screen.getByRole('list')).toHaveAttribute('data-variant', 'segmented');
    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('data-tokens', 'md-comp-list');
    expect(item).toHaveClass('bg-tertiary');
    expect(item).not.toHaveClass('bg-[var(--_md-comp-list-container-color)]');
  });
});

describe('List switch items', () => {
  it("draw their track with the switch's component tokens", () => {
    render(
      <List aria-label="Privacy">
        <ListItem key="search" control="switch">
          Show my profile
        </ListItem>
      </List>,
    );
    const item = screen.getByRole('switch').closest('label')!;
    const track = item.querySelector('[data-slot="track"]');
    expect(track).toHaveAttribute('data-tokens', 'md-comp-switch');
  });
});

describe('List classNames', () => {
  it('puts the selectionIndicator and expandButton slots on their parts', () => {
    const slots = { selectionIndicator: 'check-x', expandButton: 'expand-x' };
    const { unmount } = render(
      <List aria-label="Labels" selectionMode="multiple" classNames={slots}>
        <ListItem key="work">Work</ListItem>
      </List>,
    );
    const option = screen.getByRole('option', { name: 'Work' });
    expect(option.querySelector('[data-selection-indicator]')).toHaveClass('check-x');
    unmount();
    render(
      <List aria-label="Folders" classNames={slots}>
        <ListItem key="photos" childItems={[<ListItem key="trips">Trips</ListItem>]}>
          Photos
        </ListItem>
      </List>,
    );
    expect(screen.getByRole('button', { name: /expand/i })).toHaveClass('expand-x');
  });
});

describe('List density', () => {
  it('sets its density on its root, for its items and their controls', async () => {
    const { container } = render(
      <ThemeScope density={-1}>
        <List aria-label="Settings" density={-3} onAction={() => {}}>
          <ListItem key="wifi" supportingText="Connected">
            Wi-Fi
          </ListItem>
          <ListItem key="bluetooth" trailing={<Switch aria-label="Bluetooth on" />}>
            Bluetooth
          </ListItem>
        </List>
      </ThemeScope>,
    );
    const list = screen.getByRole('grid', { name: 'Settings' });
    expect(list).toHaveAttribute('data-density', '-3');
    expect(screen.getByRole('switch').closest('label')).not.toHaveAttribute('data-density');
    expect(await axeViolations(container)).toEqual([]);
  });

  it("follows its scope's density when it sets none", () => {
    render(
      <ThemeScope density={-2}>
        <List aria-label="Plain">
          <ListItem key="a">One</ListItem>
        </List>
      </ThemeScope>,
    );
    expect(screen.getByRole('list', { name: 'Plain' })).not.toHaveAttribute('data-density');
    expect(screen.getByText('One').closest('li')).toHaveClass(
      'pt-[calc(10px+var(--md-sys-density,0)*2px)]',
      'min-h-[calc(56px+var(--md-sys-density,0)*4px)]',
    );
  });
});
