'use client';

import { Fab, IconButton, NavigationRail, NavigationRailItem, TopAppBar } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { useState, type CSSProperties } from 'react';
import {
  EditIcon,
  HomeIcon,
  MenuIcon,
  PersonIcon,
  SearchIcon,
  SettingsIcon,
} from '../../components/icons';

/**
 * A rail and top bar on one raised surface, and the page a rounded pane on it.
 *
 * - `--app-frame-gap` is the gap below and beside the pane.
 * - The pane scrolls by itself, so its corners stay put. It needs an explicit height: as a flex
 *   child, `flex-1` alone would defeat the height of whatever it holds.
 * - The rail sits above the bar and the pane, so a flyout opens over them.
 * - On a phone the page is flat and the rail is a drawer.
 */
export function AppFrameApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div
      style={{ '--app-frame-gap': '16px' } as CSSProperties}
      className="flex h-dvh overflow-hidden bg-surface text-on-surface medium:bg-surface-container"
    >
      <NavigationRail
        aria-label="Main"
        modal
        hideOnCollapse="compact"
        expanded={drawerOpen}
        onExpandedChange={setDrawerOpen}
        classNames={{ root: 'relative z-30 h-full bg-surface-container' }}
        header={
          <div className="flex flex-col items-center gap-4">
            <a
              href="#overview"
              aria-label="Workspace home"
              className="flex size-10 items-center justify-center rounded-corner-medium bg-primary-container text-title-medium text-on-primary-container no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              <span aria-hidden="true">W</span>
            </a>
            <Fab elevation="lowered" icon={<EditIcon />} aria-label="New item" />
          </div>
        }
      >
        <NavigationRailItem href="#overview" icon={<HomeIcon />} selected>
          Overview
        </NavigationRailItem>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People">
          <NavigationRailGroupItem href="#team">Team</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#invites">Invites</NavigationRailGroupItem>
        </NavigationRailGroup>
        <NavigationRailGroup id="settings" icon={<SettingsIcon />} label="Settings">
          <NavigationRailGroupItem href="#general">General</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#security">Security</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopAppBar
          variant="small"
          title="Workspace"
          className="z-20 shrink-0 bg-surface [transition-property:none] medium:bg-surface-container"
          // Lines the actions up with the pane's end edge.
          classNames={{ actions: 'medium:pe-(--app-frame-gap)' }}
          navigationIcon={
            <IconButton
              variant="standard"
              className="medium:hidden"
              icon={<MenuIcon />}
              aria-label="Open navigation"
              onPress={() => setDrawerOpen(true)}
            />
          }
          actions={<IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-surface medium:me-(--app-frame-gap) medium:mb-(--app-frame-gap) medium:h-[calc(100dvh-64px-var(--app-frame-gap))] medium:flex-none medium:rounded-corner-large">
          {/* Sticky from the start, so nothing shifts when it begins to stick. */}
          <header className="sticky top-0 z-10 bg-surface px-6 py-4">
            <h1 className="m-0 text-title-large">Overview</h1>
          </header>
          <div className="flex flex-col gap-6 px-6 pb-6">
            {Array.from({ length: 24 }, (_, index) => (
              <p key={index} className="m-0 text-body-large text-on-surface-variant">
                The pane scrolls by itself, with no page scroll. Section {index + 1}.
              </p>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
