import type { ReactNode } from 'react';
import { InlineCode } from '../components/inline-code';
import { COMPONENT_META } from './components/catalog';

/** One group of changes in a release, such as "Components" or "Fixes". */
export interface ReleaseSection {
  title: string;
  items: ReactNode[];
}

/** A published version of `@windmorph/react`, as the "What's new" page lists it. */
export interface Release {
  /** The npm version, e.g. `0.2.0`. */
  version: string;
  /** The publish date, `YYYY-MM-DD`. */
  date: string;
  /** One or two sentences on what the release is about. */
  summary: ReactNode;
  sections: ReleaseSection[];
}

/** The core's component pages (Windmorph Pro and the Primitives reference aside). */
const CORE_PAGE_COUNT = COMPONENT_META.filter(
  (meta) => !meta.pro && meta.railGroup !== 'primitives',
).length;

/**
 * Every release, newest first. A new version adds an entry at the top; earlier entries are
 * never rewritten.
 */
export const RELEASES: Release[] = [
  {
    version: '0.1.0',
    date: '2026-10-13',
    summary: (
      <>
        The first release: Material Design 3 Expressive for React, with {CORE_PAGE_COUNT} documented
        component families, six themes, the Expressive motion system and shapes, and Next.js
        support.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            The M3 Expressive set: buttons in five sizes with round and square shapes, toggles and a
            press morph; icon buttons, connected button groups, split buttons, FABs and the FAB
            menu.
          </>,
          <>
            Inputs and selection: text fields, select and autocomplete, checkboxes, radios,
            switches, sliders (including range, vertical and centred), chips, and date and time
            pickers.
          </>,
          <>
            Containment, navigation and feedback: cards, dialogs, menus, sheets, lists, the
            carousel, the navigation rail, the flexible navigation bar, tabs, top app bars, search,
            docked and floating toolbars, snackbars, tooltips, badges, dividers, progress indicators
            (including wavy), the loading indicator and pull to refresh.
          </>,
          <>
            Every component takes <InlineCode>variant</InlineCode>, <InlineCode>size</InlineCode>,{' '}
            <InlineCode>className</InlineCode> and <InlineCode>classNames</InlineCode>, works
            controlled or uncontrolled, and exposes its states as <InlineCode>data-*</InlineCode>{' '}
            attributes.
          </>,
        ],
      },
      {
        title: 'Checked against the spec',
        items: [
          <>
            Design intent comes from m3.material.io; sizes, colours, shapes and springs come from
            the Jetpack Compose Material 3 token files. Where the library differs from Compose, the
            component&apos;s API page says how and why.
          </>,
          <>
            Deprecated components are left out on purpose: the navigation drawer, the original
            navigation bar, the small FAB, the segmented button and the bottom app bar each have an
            Expressive replacement.
          </>,
        ],
      },
      {
        title: 'Themes',
        items: [
          <>
            Six built-in themes generated with the 2025 colour spec, each in light and dark and at
            standard, medium and high contrast, plus success and warning colours.
          </>,
          <>
            <InlineCode>ThemeProvider</InlineCode>, <InlineCode>ThemeScope</InlineCode> for a themed
            subtree, <InlineCode>createTheme</InlineCode> for a theme of your own and a CLI that
            writes it to static CSS.
          </>,
          <>
            No theme flash: the theme is read from a cookie on the server, or applied before first
            paint by <InlineCode>ThemeScript</InlineCode> on static sites.
          </>,
        ],
      },
      {
        title: 'Motion and shape',
        items: [
          <>
            The expressive and standard motion schemes, with spatial and effects springs at three
            speeds, as CSS <InlineCode>linear()</InlineCode> easings and as Motion springs.
          </>,
          <>
            The 35 Expressive shapes and shape morphing, from a port of Android&apos;s{' '}
            <InlineCode>graphics.shapes</InlineCode> library.
          </>,
          <>Reduced motion is respected everywhere: morphs and overshoot are switched off.</>,
        ],
      },
      {
        title: 'Accessibility',
        items: [
          <>
            Built on React Aria: WCAG 2.2 AA, full keyboard support, visible focus rings, 48px touch
            targets and right-to-left layouts.
          </>,
          <>Components that need an accessible name require one in their types.</>,
        ],
      },
      {
        title: 'Frameworks and styling',
        items: [
          <>
            React 19 with Tailwind CSS v4, or a precompiled stylesheet for projects without
            Tailwind.
          </>,
          <>
            Next.js App Router and Pages Router: <InlineCode>&quot;use client&quot;</InlineCode>{' '}
            kept per file, cookie theming and <InlineCode>NextRouterProvider</InlineCode> for client
            routing.
          </>,
        ],
      },
    ],
  },
];

/** A version's anchor on the "What's new" page: `0.1.0` → `v0-1-0`. */
export function releaseAnchor(version: string): string {
  return `v${version.replace(/\./g, '-')}`;
}
