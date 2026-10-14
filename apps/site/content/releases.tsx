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
    // A placeholder: the real publish date is set when 0.1.0 is released.
    date: '2026-10-13',
    summary: (
      <>
        The first release: Material Design 3 Expressive for React, with {CORE_PAGE_COUNT} documented
        component families, six themes, component tokens, the Expressive motion system and shapes,
        and Next.js support.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            The M3 Expressive set: buttons in five sizes with round and square shapes, toggles and a
            press morph; icon buttons, button groups (with an overflow menu), split buttons, FABs
            and the FAB menu.
          </>,
          <>
            Inputs and selection: text fields, select and autocomplete, checkboxes, radios,
            switches, sliders (including range, vertical and centred), chips, and date and time
            pickers, docked or in a dialog.
          </>,
          <>
            Containment, navigation and feedback: cards, dialogs, menus (with submenus and context
            menus), sheets, lists (with sections), the carousel, dividers (with an optional label),
            the navigation rail, the flexible navigation bar, tabs, top app bars, search, docked and
            floating toolbars, snackbars, tooltips, badges, progress indicators (including wavy),
            the loading indicator and <InlineCode>PullToRefresh</InlineCode>.
          </>,
          <>
            Components adapt to the window: <InlineCode>SearchBar</InlineCode> opens a full-screen
            view on phones and a docked one on larger windows (
            <InlineCode>view=&quot;auto&quot;</InlineCode>, the default), and a menu or select can
            open as a bottom sheet on phones, where a submenu replaces the menu, with a back button.
          </>,
        ],
      },
      {
        title: 'Checked against the spec',
        items: [
          <>
            Design intent comes from m3.material.io; sizes, colours, shapes and springs come from
            the Jetpack Compose Material 3 token files. Where the library differs from Compose, the
            component&apos;s API page says how and why, and the Spec status page lists it.
          </>,
          <>
            Deprecated components are left out on purpose: the navigation drawer, the original
            navigation bar, the small FAB, the segmented button and the bottom app bar each have an
            Expressive replacement.
          </>,
        ],
      },
      {
        title: 'Themes and tokens',
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
          <>
            Component tokens: M3&apos;s component tokens as CSS variables, such as{' '}
            <InlineCode>--md-comp-dialog-container-color</InlineCode>. They restyle every instance
            of a component from CSS, for the whole app, per theme or inside any element, without a
            class on each one.
          </>,
          <>
            Text follows the reader&apos;s browser font size: the type scale is in rem, while sizes,
            padding and corners stay in px. Containers with text grow to fit it, up to 200% text.
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
        title: 'Customisation',
        items: [
          <>
            <InlineCode>className</InlineCode> styles a component&apos;s outermost element and{' '}
            <InlineCode>classNames</InlineCode> styles its parts, and your classes always win over
            the library&apos;s. Overlays such as dialogs, menus, sheets and tooltips take{' '}
            <InlineCode>className</InlineCode> and <InlineCode>style</InlineCode> on their outermost
            element; style their surface with <InlineCode>classNames.panel</InlineCode>.
          </>,
          <>
            Layout safety: layout classes such as <InlineCode>fixed</InlineCode>,{' '}
            <InlineCode>overflow-hidden</InlineCode>, <InlineCode>w-full</InlineCode> or a transform
            move or size a component without hiding, clipping or breaking its parts.
          </>,
          <>
            Every built-in word a component shows or announces comes from its{' '}
            <InlineCode>labels</InlineCode> or <InlineCode>strings</InlineCode> prop, in English by
            default, so it can be translated.
          </>,
          <>
            Components expose their states as <InlineCode>data-*</InlineCode> attributes, and those
            with state work controlled or uncontrolled.
          </>,
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
        title: 'Frameworks, styling and size',
        items: [
          <>
            React 19 with Tailwind CSS v4, or a precompiled stylesheet for projects without
            Tailwind.
          </>,
          <>
            Next.js App Router and Pages Router: <InlineCode>&quot;use client&quot;</InlineCode>{' '}
            kept per file, every export importable from a Server Component, cookie theming and{' '}
            <InlineCode>NextRouterProvider</InlineCode> for client routing.
          </>,
          <>
            Parts that are not always needed load on demand: built-in tooltips, a menu&apos;s bottom
            sheet, a button group&apos;s overflow menu and the loading indicators inside fields and{' '}
            <InlineCode>PullToRefresh</InlineCode>. They also preload when the browser is first
            idle, so the first hover or open is usually instant.
          </>,
          <>
            Tested on Chrome and Edge. Safari 17.5+ and Firefox 129+ are supported targets, with
            full testing coming next.
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
