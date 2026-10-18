/** The package managers the install commands are shown for, the default first. */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
