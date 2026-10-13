'use client';

import {
  BUILT_IN_THEME_NAMES,
  Button,
  ButtonGroup,
  Card,
  CONTRAST_LEVEL_NAMES,
  Menu,
  MenuItem,
  MenuTrigger,
  Switch,
  ThemeScope,
  type ColorMode,
  type ContrastLevel,
} from '@windmorph/react';
import { useState } from 'react';

const MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Auto',
};

/** The semantic colour roles previewed as swatches, so a theme change is visible at a glance. */
const SWATCHES = [
  { role: 'bg-primary text-on-primary', label: 'Primary' },
  { role: 'bg-secondary text-on-secondary', label: 'Secondary' },
  { role: 'bg-tertiary text-on-tertiary', label: 'Tertiary' },
  { role: 'bg-error text-on-error', label: 'Error' },
  { role: 'bg-primary-container text-on-primary-container', label: 'Primary container' },
  { role: 'bg-surface-container-high text-on-surface', label: 'Surface' },
] as const;

/**
 * A self-contained theming preview: the controls drive local state and a `ThemeScope`
 * applies that state to the card only, so switching is visible here without changing the
 * rest of the page. Built from `@windmorph/react` components and semantic token utilities only.
 */
export function ThemeSwitcherDemo() {
  const [theme, setTheme] = useState<string>('baseline');
  const [mode, setMode] = useState<ColorMode>('light');
  const [contrast, setContrast] = useState<ContrastLevel>('standard');
  const [expressive, setExpressive] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <MenuTrigger>
          <Button variant="outlined" size="sm">{`Theme: ${theme}`}</Button>
          <Menu
            aria-label="Colour theme"
            selectionMode="single"
            selectedKeys={[theme]}
            onAction={(key) => setTheme(String(key))}
          >
            {BUILT_IN_THEME_NAMES.map((name) => (
              <MenuItem key={name}>{name}</MenuItem>
            ))}
          </Menu>
        </MenuTrigger>

        <ButtonGroup
          variant="connected"
          size="sm"
          aria-label="Colour mode"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode]}
          onSelectionChange={(keys) => {
            const [value] = [...keys];
            if (value) setMode(value as ColorMode);
          }}
        >
          {(['light', 'dark', 'system'] as const).map((value) => (
            <Button key={value} toggle value={value}>
              {MODE_LABELS[value]}
            </Button>
          ))}
        </ButtonGroup>

        <MenuTrigger>
          <Button variant="outlined" size="sm">{`Contrast: ${contrast}`}</Button>
          <Menu
            aria-label="Contrast level"
            selectionMode="single"
            selectedKeys={[contrast]}
            onAction={(key) => setContrast(String(key) as ContrastLevel)}
          >
            {CONTRAST_LEVEL_NAMES.map((name) => (
              <MenuItem key={name}>{name}</MenuItem>
            ))}
          </Menu>
        </MenuTrigger>

        <Switch selected={expressive} onSelectedChange={setExpressive}>
          Expressive motion
        </Switch>
      </div>

      <ThemeScope
        theme={theme}
        mode={mode}
        contrast={contrast}
        motion={expressive ? 'expressive' : 'standard'}
      >
        <Card variant="elevated" className="flex flex-col gap-4 bg-surface p-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="filled">Filled</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="outlined">Outlined</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 medium:grid-cols-3">
            {SWATCHES.map((swatch) => (
              <div
                key={swatch.label}
                className={`${swatch.role} rounded-corner-medium px-3 py-4 text-label-large`}
              >
                {swatch.label}
              </div>
            ))}
          </div>
        </Card>
      </ThemeScope>
    </div>
  );
}
