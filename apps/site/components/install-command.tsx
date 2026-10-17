import { highlightSource } from '../lib/highlight';
import { PACKAGE_MANAGERS, type PackageManager } from '../lib/package-managers';
import { InstallCommandSwitcher } from './install-command-switcher';

const ADD: Record<PackageManager, string> = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
};

/**
 * The command that installs `packages`, for pnpm, npm and yarn, highlighted at build time;
 * the viewer picks their package manager. A Server Component.
 */
export async function InstallCommand({ packages }: { packages: string }) {
  const commands = Object.fromEntries(
    PACKAGE_MANAGERS.map((manager) => [manager, `${ADD[manager]} ${packages}`]),
  ) as Record<PackageManager, string>;
  const html = Object.fromEntries(
    await Promise.all(
      PACKAGE_MANAGERS.map(async (manager) => [
        manager,
        await highlightSource(commands[manager], 'bash'),
      ]),
    ),
  ) as Record<PackageManager, string>;
  return <InstallCommandSwitcher commands={commands} html={html} />;
}
