'use client';

import { IconButton, SideSheet, useTheme } from '@windmorph/react';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { DarkModeIcon, LightModeIcon, SettingsIcon } from '../../components/icons';
import { ThemeControls } from './theme-controls';

const OpenDisplaySettings = createContext<(() => void) | null>(null);

/**
 * The site's one display-settings side sheet (theme, mode, contrast, motion, direction). Any
 * `DisplaySettingsButton` under it opens the same sheet: the rail's, the compact app bar's
 * and the playground's.
 */
export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <OpenDisplaySettings value={() => setOpen(true)}>
      {children}
      <SideSheet
        title="Display"
        open={open}
        onOpenChange={setOpen}
        classNames={{ panel: 'w-[320px]' }}
        labels={{ close: 'Close display settings' }}
      >
        <ThemeControls />
      </SideSheet>
    </OpenDisplaySettings>
  );
}

/** An icon button (with its tooltip) that opens the display settings. */
export function DisplaySettingsButton({ size }: { size?: 'xs' | 'sm' }) {
  const open = useContext(OpenDisplaySettings);
  if (!open) throw new Error('DisplaySettingsButton needs a DisplaySettingsProvider.');
  return (
    <IconButton
      variant="standard"
      size={size}
      icon={<SettingsIcon />}
      aria-label="Display settings"
      aria-haspopup="dialog"
      onPress={open}
    />
  );
}

/**
 * One press between light and dark: it shows the mode it switches to (a moon in light, a sun
 * in dark) and sets that mode explicitly, the same setting the display settings' Mode row
 * shows (where "Auto" follows the system).
 */
export function ColorModeButton() {
  const { resolvedMode, setMode } = useTheme();
  const next = resolvedMode === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      variant="standard"
      icon={next === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      aria-label={next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
      data-color-mode-toggle=""
      onPress={() => setMode(next)}
    />
  );
}
