'use client';

import {
  COLOR_MODES,
  CONTRAST_LEVEL_NAMES,
  MOTION_SCHEMES,
  useTheme,
  type ColorMode,
  type ContrastLevel,
  type MotionScheme,
} from '@windmorph/react';

const selectClass =
  'rounded-corner-small bg-surface-container-highest px-3 py-2 text-body-large text-on-surface';

export function ThemeControls() {
  const {
    theme,
    themes,
    setTheme,
    mode,
    setMode,
    resolvedMode,
    contrast,
    setContrast,
    motion,
    setMotion,
  } = useTheme();
  return (
    <fieldset className="flex flex-wrap items-end gap-4">
      <legend className="mb-2 text-title-medium">Theme</legend>
      <label className="flex flex-col gap-1 text-label-large">
        Colour theme
        <select className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value)}>
          {themes.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-label-large">
        Mode
        <select
          className={selectClass}
          value={mode}
          onChange={(e) => setMode(e.target.value as ColorMode)}
        >
          {COLOR_MODES.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-label-large">
        Contrast
        <select
          className={selectClass}
          value={contrast}
          onChange={(e) => setContrast(e.target.value as ContrastLevel)}
        >
          {CONTRAST_LEVEL_NAMES.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-label-large">
        Motion
        <select
          className={selectClass}
          value={motion}
          onChange={(e) => setMotion(e.target.value as MotionScheme)}
        >
          {MOTION_SCHEMES.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <output className="text-body-medium text-on-surface-variant" data-testid="resolved-mode">
        Resolved mode: {resolvedMode}
      </output>
    </fieldset>
  );
}
