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
  /**
   * The publish date, `YYYY-MM-DD`. Left out until the version is published, so the page says
   * it's coming instead of showing a date that hasn't happened (`releases.test.ts` fails once
   * the core's `package.json` reaches an undated version).
   */
  date?: string;
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
    version: '0.2.0',
    date: '2026-11-09',
    summary: (
      <>
        <InlineCode>TimeField</InlineCode>, one navigation rail for every window size, and pieces
        for building anchored overlays, beside Windmorph Pro&apos;s data, calendar and navigation
        components.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>TimeField</InlineCode>, the time sibling of{' '}
            <InlineCode>DateField</InlineCode>: it reads forgiving typing and paste and opens the{' '}
            <InlineCode>TimePicker</InlineCode> in a dialog. <InlineCode>Time</InlineCode> and{' '}
            <InlineCode>parseTime</InlineCode> are exported, so an app needs no date library for it.
          </>,
          <>
            <InlineCode>NavigationRail</InlineCode> takes{' '}
            <InlineCode>hideOnCollapse=&quot;compact&quot;</InlineCode>, so one rail is the rail on
            larger windows and the drawer on a phone, and{' '}
            <InlineCode>useNavigationRail()</InlineCode> serves custom destinations.
          </>,
          <>
            <InlineCode>ButtonGroup</InlineCode> takes <InlineCode>fullWidth</InlineCode>: a
            connected group still spans its container by default, and{' '}
            <InlineCode>fullWidth=&#123;false&#125;</InlineCode> sizes it to its buttons.
          </>,
          <>
            <InlineCode>useRevealEntering</InlineCode>, <InlineCode>toAriaPlacement</InlineCode> and{' '}
            <InlineCode>closedByOverlayOptions</InlineCode> in{' '}
            <InlineCode>@windmorph/react/primitives</InlineCode>, for anchored overlays that behave
            as <InlineCode>Menu</InlineCode> does.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>DataTable</InlineCode>, <InlineCode>DataGrid</InlineCode>,{' '}
            <InlineCode>Calendar</InlineCode>, <InlineCode>TreeView</InlineCode>,{' '}
            <InlineCode>NavigationRailGroup</InlineCode>, <InlineCode>Popover</InlineCode> and{' '}
            <InlineCode>CopyField</InlineCode>, each with its own page here.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A <InlineCode>TextField</InlineCode> with <InlineCode>type</InlineCode>{' '}
            <InlineCode>date</InlineCode>, <InlineCode>time</InlineCode>,{' '}
            <InlineCode>datetime-local</InlineCode>, <InlineCode>month</InlineCode> or{' '}
            <InlineCode>week</InlineCode> floats its label while empty, so it no longer covers the
            format the browser draws.
          </>,
          <>
            <InlineCode>DialogContent</InlineCode> no longer clips the floated label of an outlined
            field placed first in a dialog.
          </>,
          <>
            A searchable <InlineCode>Select</InlineCode>&apos;s sheet keeps its search at the top
            while the options scroll under it.
          </>,
          <>
            A selected <InlineCode>NavigationRailItem</InlineCode> or{' '}
            <InlineCode>NavigationBarItem</InlineCode> keeps an explicit{' '}
            <InlineCode>aria-current</InlineCode>, for a destination that shows as current without
            being the page.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.1.2',
    date: '2026-11-07',
    summary: (
      <>
        Fixes from the first weeks in apps: server-rendered pages that stream keep their HTML on a
        dark device, date pickers read a selected today, and bottom sheets stay above the phone
        keyboard.
      </>
    ),
    sections: [
      {
        title: 'Fixes',
        items: [
          <>
            <InlineCode>ThemeProvider</InlineCode> no longer makes React discard server HTML
            streamed behind a Suspense boundary (a Next.js <InlineCode>loading.tsx</InlineCode>):
            with <InlineCode>mode=&quot;system&quot;</InlineCode> on a dark device, the page could
            show twice for a moment. <InlineCode>useTheme()</InlineCode> now resolves{' '}
            <InlineCode>resolvedMode</InlineCode> itself; the API is unchanged.
          </>,
          <>
            In development, <InlineCode>ThemeProvider</InlineCode> warns when a saved theme the
            server didn&apos;t render changes the theme while streamed content is still arriving,
            and names the fix: read the cookie with <InlineCode>getThemeFromCookies</InlineCode> and
            pass every value as a <InlineCode>default*</InlineCode> prop. The Next.js guide&apos;s
            example now passes <InlineCode>defaultDensity</InlineCode> too.
          </>,
          <>
            Date pickers: a selected day that is also today shows the selected day&apos;s on-primary
            text instead of today&apos;s primary text, which couldn&apos;t be read on the primary
            fill (modal and docked); the same for the current year and the ends of a range.
          </>,
          <>
            Bottom sheets stay above an on-screen keyboard and keep within what it leaves showing,
            and a searchable <InlineCode>Select</InlineCode>&apos;s sheet keeps its full height as
            the search filters, so its results are never hidden behind the keyboard.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.1.1',
    date: '2026-10-28',
    summary: (
      <>
        Published from GitHub Actions with npm provenance, so the package on npm links to the commit
        and build it came from. No code changes from 0.1.0.
      </>
    ),
    sections: [],
  },
  {
    version: '0.1.0',
    date: '2026-10-27',
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
            Density, as M3 defines it: <InlineCode>density</InlineCode> from 0 to −3 on{' '}
            <InlineCode>ThemeProvider</InlineCode>, a <InlineCode>ThemeScope</InlineCode> or a
            single component makes fields, menus, controls, lists and tabs more compact, 4px a step,
            while touch targets stay 48px.
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
          <>
            Reduced motion is respected everywhere: slides, size and shape changes, morphs and
            rotations happen at once, while fades, colours and essential motion (progress, drags, a
            pull) stay.
          </>,
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
            <InlineCode>labels</InlineCode> prop, in English by default, so it can be translated.
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
