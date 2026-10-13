'use client';

import { useSyncExternalStore } from 'react';
import { DIRECTION_KEY } from '../direction';
import {
  Button,
  ButtonGroup,
  CONTRAST_LEVEL_NAMES,
  Menu,
  MenuItem,
  MenuTrigger,
  Switch,
  useTheme,
  type ColorMode,
  type ContrastLevel,
} from '@windmorph/react';

const MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Auto',
};

/**
 * Text direction for the whole page, so every example can be checked in RTL. The root
 * layout's pre-paint script applies the stored choice (see `DIRECTION_SCRIPT`); this reads
 * it after hydration and writes changes back.
 */
function subscribeToDirection(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  return () => observer.disconnect();
}

function useDocumentDirection() {
  // `<html dir>` is the source of truth; the server render is LTR.
  const rtl = useSyncExternalStore(
    subscribeToDirection,
    () => document.documentElement.dir === 'rtl',
    () => false,
  );
  const change = (next: boolean) => {
    document.documentElement.dir = next ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(DIRECTION_KEY, next ? 'rtl' : 'ltr');
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for the page.
    }
  };
  return [rtl, change] as const;
}

/**
 * Theme, mode, contrast, motion and direction controls, built only from library
 * components (`Menu` / `ButtonGroup` / `Switch`) and `useTheme` — no `<select>`, no
 * non-library UI.
 */
export function ThemeControls() {
  const { theme, themes, setTheme, mode, setMode, contrast, setContrast, motion, setMotion } =
    useTheme();
  const [rtl, setRtl] = useDocumentDirection();

  return (
    <div className="flex flex-col items-start gap-4 pb-6">
      <MenuTrigger>
        <Button variant="outlined" size="sm">{`Theme: ${theme}`}</Button>
        <Menu
          aria-label="Colour theme"
          selectionMode="single"
          selectedKeys={[theme]}
          onAction={(key) => setTheme(String(key))}
        >
          {themes.map((name) => (
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

      <Switch
        selected={motion === 'expressive'}
        onSelectedChange={(on) => setMotion(on ? 'expressive' : 'standard')}
      >
        Expressive motion
      </Switch>

      <Switch selected={rtl} onSelectedChange={setRtl}>
        Right to left
      </Switch>
    </div>
  );
}
