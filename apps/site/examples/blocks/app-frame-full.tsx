'use client';

import {
  IconButton,
  NavigationRail,
  NavigationRailItem,
  SideSheet,
  TopAppBar,
} from '@windmorph/react';
import {
  NavigationRailGroup,
  NavigationRailGroupItem,
  SidePanelRail,
  SidePanelRailItem,
} from '@windmorph/react-pro';
import { useState, type CSSProperties } from 'react';
import { HomeIcon, MenuIcon, PersonIcon, SearchIcon, SettingsIcon } from '../../components/icons';

/**
 * The app frame with a side panel rail, whose items open a standard side sheet between the pane
 * and the strip. The pane narrows to make room, and the sheet is a card with the same gap.
 */
export function AppFrameFull() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
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
      >
        <NavigationRailItem href="#overview" icon={<HomeIcon />} selected>
          Overview
        </NavigationRailItem>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People">
          <NavigationRailGroupItem href="#team">Team</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#invites">Invites</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopAppBar
          variant="small"
          title="Workspace"
          className="z-20 shrink-0 bg-surface medium:bg-surface-container"
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
        <div className="flex min-h-0 flex-1">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-surface medium:mb-(--app-frame-gap) medium:h-[calc(100dvh-64px-var(--app-frame-gap))] medium:flex-none medium:grow medium:basis-0 medium:rounded-corner-large">
            <header className="sticky top-0 z-10 bg-surface px-6 py-4">
              <h1 className="m-0 text-title-large">Overview</h1>
            </header>
            <div className="flex flex-col gap-6 px-6 pb-6">
              {Array.from({ length: 24 }, (_, index) => (
                <p key={index} className="m-0 text-body-large text-on-surface-variant">
                  The strip at the end edge holds secondary tools. Section {index + 1}.
                </p>
              ))}
            </div>
          </main>
          <SideSheet
            variant="standard"
            detached
            divider={false}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title="Notes"
            classNames={{
              frame: 'pt-0 pb-(--app-frame-gap) ps-(--app-frame-gap) pe-0',
              panel: 'w-[320px] rounded-corner-large bg-surface shadow-none',
              header: 'border-b border-solid border-outline-variant',
            }}
          >
            <p className="m-0 pt-4 text-body-medium text-on-surface-variant">
              Your notes appear here, beside the page.
            </p>
          </SideSheet>
          <SidePanelRail aria-label="Tools" role="group">
            <SidePanelRailItem
              selected={sheetOpen}
              onPress={() => setSheetOpen((open) => !open)}
              icon={<SettingsIcon />}
            >
              Notes
            </SidePanelRailItem>
          </SidePanelRail>
        </div>
      </div>
    </div>
  );
}
