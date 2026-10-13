'use client';

import {
  Button,
  ButtonGroup,
  Fab,
  IconButton,
  LinearProgressIndicator,
  LoadingIndicator,
  Switch,
  ThemeScope,
} from '@windmorph/react';
import { AddIcon, StarIcon, StarOutlineIcon } from '../icons';
import { useLoopStep, usePressedStep } from './use-loop-step';

const THEMES = ['baseline', 'ocean', 'forest', 'sunset', 'rose'] as const;
const VIEWS = ['day', 'week', 'month'] as const;
const STEP_MS = 2400;

/** Each move presses the view it selects, the switch and the star. */
const pressTargets = (step: number) =>
  `[data-press-view="${cycle(VIEWS, step)}"], [data-press-hero]`;

/** The item for `step`, wrapping around the list. */
function cycle<T>(list: readonly [T, ...T[]], step: number): T {
  return list[step % list.length] ?? list[0];
}

/**
 * The home page's hero: live components that change theme, selection and progress on a loop.
 * It's decorative (`inert`, hidden from assistive technology), pauses off screen and holds
 * still when the visitor prefers reduced motion.
 */
export function HeroReel() {
  const { ref, step } = useLoopStep(STEP_MS);
  const shown = usePressedStep(ref, step, pressTargets);

  const theme = cycle(THEMES, shown);
  const view = cycle(VIEWS, shown);
  const on = shown % 2 === 1;

  return (
    <ThemeScope
      ref={ref}
      theme={theme}
      inert
      aria-hidden="true"
      className="flex h-full min-h-[280px] flex-col items-center justify-center gap-8 bg-surface-container p-8 transition-colors duration-500 motion-reduce:transition-none"
    >
      <div className="flex items-center gap-6">
        <LoadingIndicator variant="contained" aria-label="Loading" />
        <span className="rounded-corner-full bg-primary-container px-4 py-1 text-label-large text-on-primary-container capitalize">
          {theme}
        </span>
      </div>
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[view]}
        aria-label="Calendar view"
      >
        <Button data-press-view="day" toggle value="day">
          Day
        </Button>
        <Button data-press-view="week" toggle value="week">
          Week
        </Button>
        <Button data-press-view="month" toggle value="month">
          Month
        </Button>
      </ButtonGroup>
      <LinearProgressIndicator
        wavy
        value={((shown % THEMES.length) + 1) / THEMES.length}
        aria-label="Progress"
        className="w-full max-w-64"
      />
      <div className="flex items-center gap-6">
        <Switch data-press-hero selected={on} icons aria-label="Notifications" />
        <IconButton
          data-press-hero
          toggle
          selected={on}
          variant="tonal"
          icon={<StarOutlineIcon />}
          selectedIcon={<StarIcon />}
          aria-label="Favourite"
        />
        <Fab color="primary-container" icon={<AddIcon />} aria-label="Add" />
      </div>
    </ThemeScope>
  );
}
