'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  COMPONENT_META_MAP,
  RAIL_GROUPS,
  pagesInRailGroup,
  type RailGroupId,
} from '../../content/components/catalog';
import { DOCS_SECTIONS } from '../../app/(docs)/sections';
import { ExpandMoreIcon, WidgetsIcon } from '../icons';
import { GROUP_ICONS } from './group-icons';
import { PageChips } from '../page-chips';

function currentRailGroup(pathname: string): RailGroupId | null {
  const match = pathname.match(/^\/components\/([^/]+)/);
  if (!match) return null;
  return COMPONENT_META_MAP[match[1]!]?.railGroup ?? null;
}

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
      className="flex items-center gap-3 rounded-full px-4 py-2.5 text-label-large text-on-surface-variant outline-none transition-colors hover:bg-on-surface/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary aria-[current=page]:bg-secondary-container aria-[current=page]:text-on-secondary-container motion-reduce:transition-none"
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

/** A collapsible component-group section — site-owned expandable markup (not a core item). */
function AccordionSection({
  id,
  railLabel,
  icon,
  current,
  defaultOpen,
  pathname,
  onNavigate,
}: {
  id: RailGroupId;
  railLabel: string;
  icon: ReactNode;
  current: boolean;
  defaultOpen: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const pages = pagesInRailGroup(id);
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-current={current ? 'true' : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full px-4 py-2.5 text-label-large text-on-surface-variant outline-none transition-colors hover:bg-on-surface/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary data-current:text-on-secondary-container motion-reduce:transition-none"
      >
        <span className="inline-flex size-6 shrink-0 [&>svg]:size-full">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-start">{railLabel}</span>
        <span
          aria-hidden="true"
          className={`inline-flex size-5 shrink-0 transition-transform duration-200 [&>svg]:size-full motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ExpandMoreIcon />
        </span>
      </button>
      {open && (
        <ul id={panelId} className="flex flex-col gap-0.5 ps-6">
          {pages.map((page) => {
            const href = `/components/${page.slug}`;
            return (
              <li key={page.slug}>
                <DrawerLink
                  href={href}
                  active={pathname === href}
                  onNavigate={onNavigate}
                  chips={
                    page.expressive || page.pro ? (
                      <PageChips expressive={page.expressive} pro={page.pro} compact />
                    ) : undefined
                  }
                >
                  {page.title}
                </DrawerLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * The compact modal-drawer navigation: the six guide sections and the component groups
 * (each an in-place accordion of component links). Rendered inside the modal
 * `NavigationRail`. Every link calls `onNavigate` to dismiss the drawer on activation.
 */
export function DrawerNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const current = currentRailGroup(pathname);
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
      {RAIL_GROUPS.map((group) => (
        <AccordionSection
          key={group.id}
          id={group.id}
          railLabel={group.railLabel}
          icon={GROUP_ICONS[group.id]}
          current={current === group.id}
          defaultOpen={current === group.id}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
