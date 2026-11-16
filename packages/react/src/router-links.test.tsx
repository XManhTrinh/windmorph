import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import {
  AssistChip,
  Button,
  Card,
  Carousel,
  ExtendedFab,
  Fab,
  FabMenu,
  FabMenuItem,
  FloatingToolbar,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  MenuTrigger,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
  SplitButton,
  ToolbarFab,
} from './index';

/**
 * A `RouterProvider`'s `useHref` (a base path, say) gives every library link its address
 * (2026-11-16): React Aria's link hooks put the resolved `href` in the props they return, and
 * links that wrote the raw `href` after them showed an address without the base path, so a new
 * tab, a copied link or a crawler went to the wrong page while a plain click still routed. A
 * plain click still hands the router the raw `href`, as React Aria does.
 */

const Icon = () => <svg viewBox="0 0 24 24" />;
const base = (href: string) => `/base${href}`;

function renderRouted(ui: ReactElement) {
  const navigate = vi.fn();
  render(
    <RouterProvider navigate={navigate} useHref={base}>
      {ui}
    </RouterProvider>,
  );
  return navigate;
}

interface LinkCase {
  name: string;
  ui: ReactElement;
  /** The link, once whatever holds it is open. */
  link: () => HTMLElement | Promise<HTMLElement>;
  href: string;
}

const linkCases: LinkCase[] = [
  {
    name: 'Button',
    ui: <Button href="/settings">Settings</Button>,
    link: () => screen.getByRole('link', { name: 'Settings' }),
    href: '/settings',
  },
  {
    name: 'IconButton',
    ui: <IconButton href="/settings" icon={<Icon />} aria-label="Settings" />,
    link: () => screen.getByRole('link', { name: 'Settings' }),
    href: '/settings',
  },
  {
    name: 'Fab',
    ui: <Fab href="/new" icon={<Icon />} aria-label="New" />,
    link: () => screen.getByRole('link', { name: 'New' }),
    href: '/new',
  },
  {
    name: 'ExtendedFab',
    ui: (
      <ExtendedFab href="/compose" icon={<Icon />}>
        Compose
      </ExtendedFab>
    ),
    link: () => screen.getByRole('link', { name: 'Compose' }),
    href: '/compose',
  },
  {
    name: 'ToolbarFab',
    ui: (
      <FloatingToolbar
        aria-label="Tools"
        fab={<ToolbarFab href="/new" icon={<Icon />} aria-label="New" />}
      >
        <IconButton icon={<Icon />} aria-label="Pen" />
      </FloatingToolbar>
    ),
    link: () => screen.getByRole('link', { name: 'New' }),
    href: '/new',
  },
  {
    name: 'Card',
    ui: (
      <Card href="/trips/kyoto">
        <h3>Kyoto</h3>
      </Card>
    ),
    link: () => screen.getByRole('link', { name: 'Kyoto' }),
    href: '/trips/kyoto',
  },
  {
    name: 'AssistChip',
    ui: <AssistChip href="/map">Open the map</AssistChip>,
    link: () => screen.getByRole('link', { name: 'Open the map' }),
    href: '/map',
  },
  {
    name: 'NavigationBarItem',
    ui: (
      <NavigationBar aria-label="Main">
        <NavigationBarItem href="/" icon={<Icon />} current>
          Home
        </NavigationBarItem>
        <NavigationBarItem href="/library" icon={<Icon />}>
          Library
        </NavigationBarItem>
      </NavigationBar>
    ),
    link: () => screen.getByRole('link', { name: 'Library' }),
    href: '/library',
  },
  {
    name: 'NavigationRailItem',
    ui: (
      <NavigationRail aria-label="Main">
        <NavigationRailItem href="/inbox" icon={<Icon />} current>
          Inbox
        </NavigationRailItem>
        <NavigationRailItem href="/sent" icon={<Icon />}>
          Sent
        </NavigationRailItem>
      </NavigationRail>
    ),
    link: () => screen.getByRole('link', { name: 'Sent' }),
    href: '/sent',
  },
  {
    name: 'SplitButton',
    ui: (
      <SplitButton
        href="/compose"
        leadingIcon={<Icon />}
        labels={{ menu: 'More send options' }}
        menu={
          <Menu aria-label="Send options">
            <MenuItem key="later">Send later</MenuItem>
          </Menu>
        }
      >
        Send
      </SplitButton>
    ),
    link: () => screen.getByRole('link', { name: 'Send' }),
    href: '/compose',
  },
  {
    name: 'FabMenuItem in the list',
    ui: (
      <FabMenu icon={<Icon />} aria-label="Create">
        <FabMenuItem icon={<Icon />} href="/compose">
          Compose
        </FabMenuItem>
      </FabMenu>
    ),
    link: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Create' }));
      const link = await screen.findByRole('link', { name: 'Compose' });
      await waitFor(() => expect(link).toHaveAttribute('data-visible'));
      return link;
    },
    href: '/compose',
  },
  {
    name: 'FabMenuItem in a menu',
    ui: (
      <FabMenu icon={<Icon />} aria-label="Create" presentation="menu">
        <FabMenuItem icon={<Icon />} href="/compose">
          Compose
        </FabMenuItem>
      </FabMenu>
    ),
    link: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Create' }));
      return screen.findByRole('menuitem', { name: 'Compose' });
    },
    href: '/compose',
  },
  {
    name: 'MenuItem',
    ui: (
      <MenuTrigger>
        <Button>Help</Button>
        <Menu aria-label="Help">
          <MenuItem key="guide" href="/docs/guide">
            Read the guide
          </MenuItem>
        </Menu>
      </MenuTrigger>
    ),
    link: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Help' }));
      return screen.findByRole('menuitem', { name: 'Read the guide' });
    },
    href: '/docs/guide',
  },
  {
    name: 'Carousel item',
    ui: (
      <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
        <div>Phở</div>
        <div>Bánh mì</div>
      </Carousel>
    ),
    link: () => screen.getByRole('link', { name: 'Bánh mì' }),
    href: '/recipes/1',
  },
  {
    name: 'ListItem',
    ui: (
      <List aria-label="Pages">
        <ListItem key="home" href="/home">
          Home
        </ListItem>
      </List>
    ),
    link: () => screen.getByRole('link', { name: 'Home' }),
    href: '/home',
  },
];

describe('links inside a RouterProvider', () => {
  it.each(linkCases)(
    '$name shows the router’s address and routes a click with the raw one',
    async ({ ui, link, href }) => {
      const navigate = renderRouted(ui);
      const element = await link();
      expect(element.tagName).toBe('A');
      expect(element).toHaveAttribute('href', base(href));
      await userEvent.click(element);
      expect(navigate).toHaveBeenCalledWith(href, undefined);
    },
  );

  it('keeps a grid list row’s link, React Aria’s own, on the router’s address', async () => {
    const navigate = renderRouted(
      <List aria-label="Pages" onAction={() => {}}>
        <ListItem key="home" href="/home">
          Home
        </ListItem>
      </List>,
    );
    const row = screen.getByRole('row', { name: 'Home' });
    expect(row).toHaveAttribute('data-href', base('/home'));
    await userEvent.click(row);
    expect(navigate).toHaveBeenCalledWith('/home', undefined);
  });

  it('still gives a disabled link no address', () => {
    renderRouted(
      <>
        <Button href="/settings" disabled>
          Settings
        </Button>
        <Carousel aria-label="Recipes" itemHref={() => '/recipes'} disabledIndexes={[0]}>
          <div>Phở</div>
        </Carousel>
        <List aria-label="Pages">
          <ListItem key="terms" href="/legal/terms" disabled>
            Terms
          </ListItem>
        </List>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('href');
    expect(screen.getByRole('link', { name: 'Phở' })).not.toHaveAttribute('href');
    expect(screen.getByText('Terms').closest('a')).not.toHaveAttribute('href');
  });
});
