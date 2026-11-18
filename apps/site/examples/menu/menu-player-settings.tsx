'use client';

import {
  IconButton,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
} from '@windmorph/react';
import { useState } from 'react';
import { FullscreenIcon, SettingsIcon } from '../../components/icons';

const QUALITIES = [
  ['auto', 'Auto'],
  ['1080', '1080p'],
  ['720', '720p'],
  ['480', '480p'],
] as const;

const SPEEDS = [
  ['0.5', '0.5×'],
  ['1', 'Normal'],
  ['1.5', '1.5×'],
  ['2', '2×'],
] as const;

/** The label of the one key a single-choice page has selected. */
const label = (choices: readonly (readonly [string, string])[], keys: Set<string>) =>
  choices.find(([key]) => keys.has(key))?.[1];

/**
 * A video player's settings menu. `portalContainer` opens it inside the player, kept within
 * it, so it moves with the player and shows in full screen. `submenuPresentation="replace"`
 * shows Quality and Playback speed in place of the first page, on the same surface, below a back
 * button; `submenuTransition="slide"` slides each page in, and `afterSelect="back"` returns to the
 * first page after a choice, which shows it. Loop is a checkbox group on the first page.
 */
export function MenuPlayerSettings() {
  const [player, setPlayer] = useState<HTMLDivElement | null>(null);
  const [quality, setQuality] = useState(new Set(['auto']));
  const [speed, setSpeed] = useState(new Set(['1']));
  const [loop, setLoop] = useState(new Set<string>());
  const keep = (set: (keys: Set<string>) => void) => (keys: unknown) =>
    set(new Set(keys as Set<string>));
  return (
    <div
      ref={setPlayer}
      className="relative flex aspect-video w-full max-w-[560px] flex-col justify-end rounded-corner-medium bg-surface-container-highest"
    >
      <div className="flex justify-end gap-[4px] p-[8px]">
        <MenuTrigger>
          <IconButton icon={<SettingsIcon />} aria-label="Settings" />
          <Menu
            aria-label="Settings"
            portalContainer={player}
            submenuPresentation="replace"
            submenuTransition="slide"
            placement="top-end"
            offset={8}
          >
            <SubmenuTrigger>
              <MenuItem key="quality" description={label(QUALITIES, quality)}>
                Quality
              </MenuItem>
              <Menu
                selectionMode="single"
                deselectable={false}
                afterSelect="back"
                selectedKeys={quality}
                onSelectionChange={keep(setQuality)}
              >
                {QUALITIES.map(([key, name]) => (
                  <MenuItem key={key}>{name}</MenuItem>
                ))}
              </Menu>
            </SubmenuTrigger>
            <SubmenuTrigger>
              <MenuItem key="speed" description={label(SPEEDS, speed)}>
                Playback speed
              </MenuItem>
              <Menu
                selectionMode="single"
                deselectable={false}
                afterSelect="back"
                selectedKeys={speed}
                onSelectionChange={keep(setSpeed)}
              >
                {SPEEDS.map(([key, name]) => (
                  <MenuItem key={key}>{name}</MenuItem>
                ))}
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
        <IconButton
          icon={<FullscreenIcon />}
          aria-label="Full screen"
          onPress={() =>
            document.fullscreenElement ? document.exitFullscreen() : player?.requestFullscreen()
          }
        />
      </div>
    </div>
  );
}
