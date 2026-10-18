'use client';

import { Button, ButtonGroup, IconButton } from '@windmorph/react';
import { CodeBlock } from '@windmorph/react-pro';
import { useSyncExternalStore, type Key } from 'react';
import { PACKAGE_MANAGERS, type PackageManager } from '../lib/package-managers';
import { ContentCopyIcon } from './icons';
import { useCopy } from './site-snackbar';

const STORAGE_KEY = 'windmorph-site-package-manager';
const CHANGE_EVENT = 'windmorph-package-manager';

/** The choice when storage can't keep it. */
let memory: PackageManager | null = null;

function isPackageManager(value: unknown): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly unknown[]).includes(value);
}

/** The viewer's package manager, remembered in local storage (when it's available). */
function readManager(): PackageManager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isPackageManager(stored) ? stored : 'pnpm';
  } catch {
    return 'pnpm';
  }
}

function subscribe(onChange: () => void) {
  // Other switchers on the page, and other tabs.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function chooseManager(manager: PackageManager) {
  try {
    localStorage.setItem(STORAGE_KEY, manager);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for the page.
    memory = manager;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The install command for each package manager, picked with a connected button group. The
 * choice is remembered per viewer and shared by every switcher; the static HTML shows pnpm,
 * and `useSyncExternalStore` swaps in the stored choice after hydration without a mismatch.
 * Copying confirms in the site snackbar.
 */
export function InstallCommandSwitcher({
  commands,
  html,
}: {
  commands: Record<PackageManager, string>;
  html: Record<PackageManager, string>;
}) {
  const manager = useSyncExternalStore<PackageManager>(
    subscribe,
    () => memory ?? readManager(),
    () => 'pnpm',
  );
  const copy = useCopy();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ButtonGroup
          variant="connected"
          size="sm"
          aria-label="Package manager"
          className="w-fit"
          selectionMode="single"
          deselectable={false}
          selectedKeys={[manager]}
          onSelectionChange={(keys: Set<Key>) => {
            const [next] = [...keys];
            if (isPackageManager(next)) chooseManager(next);
          }}
        >
          {PACKAGE_MANAGERS.map((name) => (
            <Button key={name} toggle value={name}>
              {name}
            </Button>
          ))}
        </ButtonGroup>
        <IconButton
          variant="standard"
          size="sm"
          icon={<ContentCopyIcon />}
          aria-label="Copy install command"
          onPress={() => void copy(commands[manager])}
        />
      </div>
      <CodeBlock
        code={commands[manager]}
        html={html[manager]}
        lang="bash"
        title="Terminal"
        copyable={false}
      />
    </div>
  );
}
