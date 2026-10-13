'use client';

import {
  Button,
  cn,
  ButtonGroup,
  ExtendedFab,
  FabMenu,
  FabMenuItem,
  FloatingToolbar,
  IconButton,
  LinearProgressIndicator,
  LoadingIndicator,
  NavigationRail,
  NavigationRailItem,
  ThemeScope,
  ToolbarFab,
} from '@windmorph/react';
import type { ReactNode } from 'react';
import {
  AddAPhotoIcon,
  AddIcon,
  BlockIcon,
  CalendarMonthIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  CropIcon,
  DescriptionIcon,
  EditIcon,
  FavoriteFilledIcon,
  FavoriteIcon,
  HelpIcon,
  InkPenIcon,
  MapIcon,
  MenuOpenIcon,
  PersonAddIcon,
  ScheduleFilledIcon,
  ScheduleIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  TuneIcon,
} from '../icons';
import { useLoopStep, usePressedStep } from './use-loop-step';

/** Google's bento loop: each state holds for about a second and a half. */
const STEP_MS = 1500;

/**
 * What each move presses: the controls marked `on` when turning active, `off` when going back
 * to rest, and the FAB menu's button both ways.
 */
const pressTargets = (step: number) =>
  `[data-press~="${step % 2 === 1 ? 'on' : 'off'}"], [data-press-fab-menu] button[aria-expanded]`;

/** The three progress indicators: full while resting, partway while active. */
const PROGRESS = [
  { key: 'first', active: 0.25, wavy: false },
  { key: 'second', active: 0.4, wavy: false },
  { key: 'third', active: 0.45, wavy: true },
] as const;

function Tile({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-corner-extra-large bg-secondary-container p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A bento grid of live M3 Expressive components that switch between a resting and an active
 * state on a loop: a FAB menu, a toolbar with its FAB, a button group, progress indicators,
 * a toolbar selection, the loading indicator, an icon button's shape morph and an expanded
 * navigation rail, in the baseline theme and flat (no elevation), like M3's own showcase:
 * the toolbars and the rail's FAB through their flat options, the FAB menu and the toolbar's
 * FAB through classes. Each change is a real press on the control, so its
 * press animation plays first. It's decorative (`inert`, hidden from assistive
 * technology), pauses off screen and holds the active state when the visitor prefers reduced
 * motion.
 */
export function ExpressiveBento() {
  const { ref, step, still } = useLoopStep(STEP_MS);
  const shown = usePressedStep(ref, step, pressTargets);
  const active = still || shown % 2 === 1;

  return (
    <ThemeScope
      ref={ref}
      theme="baseline"
      inert
      aria-hidden="true"
      className="grid auto-rows-[220px] grid-cols-2 gap-4 rounded-corner-extra-large bg-surface p-4 large:h-[720px] large:auto-rows-auto large:grid-cols-3 large:grid-rows-[repeat(10,minmax(0,1fr))] large:p-6"
    >
      {/* FAB menu: the FAB opens into its actions */}
      <Tile className="col-span-2 row-span-2 large:col-span-1 large:col-start-1 large:row-span-6 large:row-start-1">
        {/* Pinned by its button, so opening grows the items up and away without moving it */}
        <div data-press-fab-menu className="absolute end-[28%] bottom-[12%]">
          <FabMenu
            open={active}
            color="primary"
            icon={<EditIcon />}
            openIcon={<CloseIcon />}
            aria-label="Album actions"
            classNames={{ button: 'bg-primary text-on-primary shadow-none' }}
          >
            <FabMenuItem className="shadow-none" icon={<CheckCircleFilledIcon />}>
              Select
            </FabMenuItem>
            <FabMenuItem className="shadow-none" icon={<AddAPhotoIcon />}>
              Add photos
            </FabMenuItem>
            <FabMenuItem className="shadow-none" icon={<ShareIcon />}>
              Share album
            </FabMenuItem>
            <FabMenuItem className="shadow-none" icon={<SearchIcon />}>
              Search
            </FabMenuItem>
          </FabMenu>
        </div>
      </Tile>

      {/* Floating toolbar with a FAB: collapsed to the FAB, then expanded */}
      <Tile className="col-span-2 large:col-span-1 large:col-start-2 large:row-span-4 large:row-start-1">
        <FloatingToolbar
          aria-label="Note actions"
          elevated={false}
          expanded={active}
          classNames={{ fab: 'data-collapsed:size-[56px]' }}
          fab={
            <ToolbarFab
              data-press="on off"
              className="shadow-none"
              tooltip={false}
              color="vibrant"
              icon={active ? <CloseIcon /> : <EditIcon />}
              aria-label="Edit"
            />
          }
        >
          <IconButton icon={<CheckIcon />} aria-label="Done" />
          <IconButton icon={<FavoriteFilledIcon />} aria-label="Favourite" />
          <IconButton icon={<DescriptionIcon />} aria-label="Notes" />
          <IconButton icon={<CalendarMonthIcon />} aria-label="Schedule" />
        </FloatingToolbar>
      </Tile>

      {/* Connected button group: a selection appears */}
      <Tile className="col-span-2 large:col-span-1 large:col-start-3 large:row-span-4 large:row-start-1">
        {/* Square, as in Google's showcase video, and opted into the press bump it shows */}
        <ButtonGroup
          variant="connected"
          shape="square"
          expandedRatio={0.15}
          selectionMode="single"
          selectedKeys={active ? ['going'] : []}
          aria-label="Reply"
          className="w-fit shrink-0 max-medium:scale-80"
        >
          <Button
            data-press="on off"
            toggle
            value="going"
            leadingIcon={active ? <CheckCircleFilledIcon /> : <CheckCircleIcon />}
          >
            Going
          </Button>
          <Button toggle value="not-going" leadingIcon={<BlockIcon />}>
            Not going
          </Button>
          <Button toggle value="maybe" leadingIcon={<HelpIcon />}>
            Maybe
          </Button>
        </ButtonGroup>
      </Tile>

      {/* Progress indicators: flat and full, then partway with a wavy one */}
      <Tile className="col-span-2 large:col-span-1 large:col-start-2 large:row-span-3 large:row-start-5">
        <div className="flex w-full max-w-sm flex-col gap-6">
          {PROGRESS.map((indicator) => (
            <LinearProgressIndicator
              key={indicator.key}
              value={active ? indicator.active : 1}
              wavy={indicator.wavy}
              aria-label="Progress"
              className="w-full"
              classNames={{ track: 'stroke-outline-variant' }}
            />
          ))}
        </div>
      </Tile>

      {/* Toolbar: one tool becomes the selected, wide button */}
      <Tile className="col-span-2 large:col-span-1 large:col-start-1 large:row-span-4 large:row-start-7">
        <FloatingToolbar aria-label="Photo tools" elevated={false}>
          <IconButton toggle variant="filled" icon={<InkPenIcon />} aria-label="Markup" />
          <IconButton toggle variant="filled" icon={<CropIcon />} aria-label="Crop" />
          <IconButton toggle variant="filled" icon={<TuneIcon />} aria-label="Adjust" />
          <IconButton
            data-press="on off"
            toggle
            selected={active}
            variant="filled"
            width="wide"
            icon={<SettingsIcon />}
            aria-label="Settings"
          />
          <IconButton toggle variant="filled" icon={<EditIcon />} aria-label="Edit" />
        </FloatingToolbar>
      </Tile>

      {/* Two small tiles: the loading indicator's morph and an icon button's shape change */}
      <div className="col-span-2 grid grid-cols-2 gap-4 large:col-span-1 large:col-start-2 large:row-span-3 large:row-start-8">
        <Tile>
          <LoadingIndicator variant="contained" aria-label="Loading" className="scale-[1.75]" />
        </Tile>
        <Tile>
          <IconButton
            data-press="on off"
            toggle
            selected={active}
            size="md"
            shape="square"
            variant="filled"
            className="bg-primary-container text-on-primary-container"
            icon={<AddIcon />}
            selectedIcon={<CloseIcon />}
            aria-label="Add"
          />
        </Tile>
      </div>

      {/* Expanded navigation rail: the current destination moves */}
      <Tile className="col-span-2 row-span-2 p-0 large:col-span-1 large:col-start-3 large:row-span-6 large:row-start-5">
        <NavigationRail
          expanded
          aria-label="Sections"
          className="absolute start-[28%] -end-px top-12 bottom-0 w-auto rounded-ss-corner-extra-large"
          header={
            <div className="flex flex-col items-start gap-6">
              <IconButton variant="standard" icon={<MenuOpenIcon />} aria-label="Collapse" />
              <ExtendedFab color="tertiary-container" elevation="flat" icon={<PersonAddIcon />}>
                Add friend
              </ExtendedFab>
            </div>
          }
        >
          <NavigationRailItem
            data-press="off"
            icon={<FavoriteIcon />}
            selectedIcon={<FavoriteFilledIcon />}
            selected={!active}
          >
            Friends
          </NavigationRailItem>
          <NavigationRailItem
            data-press="on"
            icon={<ScheduleIcon />}
            selectedIcon={<ScheduleFilledIcon />}
            selected={active}
          >
            Alarms
          </NavigationRailItem>
          <NavigationRailItem icon={<MapIcon />}>Map</NavigationRailItem>
        </NavigationRail>
      </Tile>
    </ThemeScope>
  );
}
