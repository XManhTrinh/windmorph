'use client';

import type { ReactNode } from 'react';
import { DOCS_SECTIONS } from '../../app/(docs)/sections';
import { WidgetsIcon, WorkspacePremiumIcon } from '../icons';
import { ComponentGroups } from './docs-rail';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** A full-bleed drawer row (link), styled with the nav token language. */
function DrawerLink({
  href,
  icon,
  active,
  onNavigate,
  chips,
  children,
}: {
  href: string;
  icon?: ReactNode;
  active: boolean;
  onNavigate: () => void;
  /** Shown after the name (the "Expressive" / "Pro" chips). */
  chips?: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className="flex min-h-12 items-center gap-3 rounded-full px-4 py-2.5 text-label-large text-on-surface-variant outline-none transition-colors hover:bg-on-surface/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary aria-[current=page]:bg-secondary-container aria-[current=page]:text-on-secondary-container motion-reduce:transition-none"
    >
      {icon != null && (
        <span className="inline-flex size-6 shrink-0 [&>svg]:size-full">{icon}</span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {/* At the end of the row, where M3's navigation drawer puts a badge label. */}
      {chips}
    </a>
  );
}

/**
 * The rail's phone sheet: the guide sections and the component groups (each a
 * `NavigationRailGroup`, an accordion here). Rendered inside the modal `NavigationRail`. Every link calls `onNavigate` to dismiss the drawer on activation.
 */
export function DrawerNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-1 px-3 pb-4">
      <p className="px-4 pb-1 pt-3 text-title-small text-on-surface-variant">Guides</p>
      {DOCS_SECTIONS.map((section) => (
        <DrawerLink
          key={section.href}
          href={section.href}
          icon={section.icon}
          active={isActive(pathname, section.href)}
          onNavigate={onNavigate}
        >
          {section.label}
        </DrawerLink>
      ))}

      <p className="px-4 pb-1 pt-4 text-title-small text-on-surface-variant">Components</p>
      <DrawerLink
        href="/components"
        icon={<WidgetsIcon />}
        active={pathname === '/components'}
        onNavigate={onNavigate}
      >
        All components
      </DrawerLink>
      {/* The Pro tags beside names stay text inside each row's link (a link can't hold
          another); the filtered index has a link of its own here, one tab stop. */}
      <DrawerLink
        href="/components?filter=pro"
        icon={<WorkspacePremiumIcon />}
        active={false}
        onNavigate={onNavigate}
      >
        Pro components
      </DrawerLink>
      <ComponentGroups pathname={pathname} />
    </div>
  );
}
