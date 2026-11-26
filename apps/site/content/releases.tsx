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
    version: '0.2.13',
    date: '2026-11-26',
    summary: (
      <>
        A standard side sheet that stays inside the page when it shuts, and the on-screen
        keyboard&apos;s height for panels of your own.
      </>
    ),
    sections: [
      {
        title: 'Fixes',
        items: [
          <>
            A shut standard <InlineCode>SideSheet</InlineCode> no longer makes the page scroll
            sideways: content it positions inside itself, such as text only screen readers read, is
            clipped with it.
          </>,
        ],
      },
      {
        title: 'Primitives',
        items: [
          <>
            <InlineCode>useKeyboardInset</InlineCode> tells how far the on-screen keyboard covers
            the bottom of the window, for a panel that sits above the keyboard or takes its place.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.12',
    date: '2026-11-23',
    summary: (
      <>
        A full-screen dialog in your dialog colour. In Windmorph Pro, video settings that stay open
        while you use them, and rounded video players with clean corners.
      </>
    ),
    sections: [
      {
        title: 'Fixes',
        items: [
          <>
            A full-screen <InlineCode>Dialog</InlineCode> paints{' '}
            <InlineCode>--md-comp-dialog-container-color</InlineCode>, as the basic dialog does, so
            the same dialog keeps its colour on a phone and on a computer, while it opens too.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>VideoPlayer</InlineCode> takes the app&apos;s speed presets and order of
            settings rows; <InlineCode>ListDetailLayout</InlineCode> takes a page heading for the
            detail shown alone; <InlineCode>StatTile</InlineCode> takes{' '}
            <InlineCode>valueText</InlineCode> and a chart series can be quiet.
          </>,
          <>
            A press anywhere inside the video settings keeps them open, the speed presets show the
            pointer, and a rounded player shows no dark rim at its corners over a bright picture. A
            rail group&apos;s divider runs its full height while the column scrolls.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.11',
    date: '2026-11-22',
    summary: (
      <>
        Menus that show their submenus in place, a list a person can put in order, and a
        media&apos;s length said the same way everywhere. In Windmorph Pro, a video player with its
        settings, a featured carousel, a shelf, a reorder list and a duration tag.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            A <InlineCode>Menu</InlineCode> can show its submenus in place (
            <InlineCode>submenuPresentation=&quot;replace&quot;</InlineCode>), below a back button,
            its height springing to each page, and open inside an element of yours. A{' '}
            <InlineCode>MenuGroup</InlineCode> can be a group of choices beside the menu&apos;s
            actions, with a selection of its own.
          </>,
          <>
            <InlineCode>ListItemVideo</InlineCode>&apos;s <InlineCode>duration</InlineCode> takes
            seconds: a clock in the page&apos;s digits, read in words.
          </>,
        ],
      },
      {
        title: 'Primitives',
        items: [
          <>
            <InlineCode>useReorder</InlineCode>, the engine of a list a person puts in order: a drag
            from a row&apos;s handle, moves by action, a cancel, and scrolling near an edge.
          </>,
          <>
            <InlineCode>formatClock</InlineCode> and <InlineCode>formatDurationWords</InlineCode>{' '}
            say a media&apos;s length, and <InlineCode>usePageHeight</InlineCode> measures a page in
            a surface whose pages replace each other.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A <InlineCode>Dialog</InlineCode>, <InlineCode>BottomSheet</InlineCode> or{' '}
            <InlineCode>SideSheet</InlineCode> opened by Space on a switch or checkbox, or by a
            screen reader&apos;s click, takes its first focus.
          </>,
          <>
            <InlineCode>dark:</InlineCode> follows the nearest <InlineCode>ThemeScope</InlineCode>,
            so a light scope on a dark page is light.
          </>,
          <>
            <InlineCode>ThemeProvider</InlineCode> stores only the person&apos;s own choices: a mode
            the app sets for a while no longer replaces theirs.
          </>,
          <>
            Dates, times and numbers keep the page&apos;s locale and hour cycle inside a region laid
            out in the other direction; icon slots size an icon in a wrapper of its own; entrances
            print their final picture and show it at once under reduced motion.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>VideoPlayer</InlineCode> and its settings,{' '}
            <InlineCode>FeaturedCarousel</InlineCode>, <InlineCode>Shelf</InlineCode>,{' '}
            <InlineCode>ReorderList</InlineCode> and <InlineCode>DurationTag</InlineCode>, with
            chapters on the time slider.
          </>,
          <>
            Fixes across the charts and <InlineCode>DataTable</InlineCode>, and a{' '}
            <InlineCode>PinInput</InlineCode> whose six boxes fit the narrowest dialog.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.10',
    date: '2026-11-18',
    summary: (
      <>
        Motion on numbers: a value or a list of values that springs on the theme&apos;s springs, a
        figure that counts to its new value, and entrances that play once, one item after another.
        In Windmorph Pro, a family of charts and a <InlineCode>DataTable</InlineCode> that scrolls
        under its header.
      </>
    ),
    sections: [
      {
        title: 'Motion on values',
        items: [
          <>
            <InlineCode>useM3SpringValue</InlineCode> and <InlineCode>useM3SpringValues</InlineCode>{' '}
            in <InlineCode>@windmorph/react/primitives</InlineCode> move a number, or a list of
            numbers, on the theme&apos;s springs, and keep their speed when a new target arrives
            mid-way. Matched by <InlineCode>keys</InlineCode>, the values a sliding window keeps
            carry on where they are, and <InlineCode>rest</InlineCode> says where a new one starts.
          </>,
          <>
            <InlineCode>AnimatedNumber</InlineCode> counts from one value to the next, in the
            value&apos;s own decimals; screen readers and copying get the value itself, never the
            figures passing.
          </>,
          <>
            <InlineCode>staggerDelays</InlineCode> and <InlineCode>useEntrance</InlineCode> play an
            entrance one item after another, once, when it first comes into view. Under reduced
            motion, values change at once.
          </>,
        ],
      },
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>useNearestReveal</InlineCode> is public, for collections built on React
            Aria&apos;s hooks outside the core: arrow keys bring an item into view without first
            centring the whole collection, so the page moves only as far as the item needs.
          </>,
          <>
            <InlineCode>themeSelector</InlineCode> gives the selector of one theme, contrast level
            and mode in the theme CSS, for values of your own that follow the themes as the colour
            roles do.
          </>,
          <>
            Windmorph now needs <InlineCode>motion</InlineCode> 14.12 or later.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A polite announcement waiting for its live region (a focused button turning pending) no
            longer throws when its page goes away first.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            Charts, in <InlineCode>@windmorph/react-pro/charts</InlineCode>, on the theme&apos;s
            colours and springs in every theme, mode and contrast level:{' '}
            <InlineCode>StatTile</InlineCode> with a <InlineCode>Sparkline</InlineCode>,{' '}
            <InlineCode>Meter</InlineCode>, <InlineCode>LineChart</InlineCode>,{' '}
            <InlineCode>BarChart</InlineCode>, <InlineCode>SegmentedBar</InlineCode> and{' '}
            <InlineCode>SegmentedList</InlineCode> (plain parts, or ordered from lightest to
            darkest), <InlineCode>RankedBars</InlineCode> and <InlineCode>FunnelBars</InlineCode>.
            They are drawn in the server&apos;s HTML, read by pointer, finger and keyboard, and move
            from where they are when the numbers change.
          </>,
          <>
            <InlineCode>ChartFrame</InlineCode>, the card a chart sits in: its title names the
            chart, a switch shows the same numbers as a table, and it has empty, loading, pending
            and error states.
          </>,
          <>
            <InlineCode>DataTable</InlineCode> takes <InlineCode>maxHeight</InlineCode>: the rows
            scroll under the header. Columns cut off by a narrow window stay within the
            keyboard&apos;s reach, arrow keys no longer scroll the page to centre the table, and the
            compact list shows every figure with its column&apos;s name.
          </>,
          <>
            <InlineCode>RichMessageField</InlineCode>&apos;s mention list keeps its first suggestion
            when it opens under a pointer at rest, so Enter mentions the best match.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.9',
    date: '2026-11-16',
    summary: (
      <>
        One name for each idea across the library (the old names still work), links that show the
        router&apos;s address, overlays that show in full screen, and a modifier key pressed alone
        that no longer brings back a focus ring. In Windmorph Pro,{' '}
        <InlineCode>MediaTimeSlider</InlineCode>, a media player&apos;s position bar, and an{' '}
        <InlineCode>Avatar</InlineCode> of any size.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            A <InlineCode>Carousel</InlineCode>&apos;s items can be links (
            <InlineCode>itemHref</InlineCode>, with <InlineCode>itemTarget</InlineCode> and{' '}
            <InlineCode>itemRel</InlineCode>), one tab stop each, that a modifier or the context
            menu opens in a new tab. Each item says its size (<InlineCode>data-size</InlineCode> and
            how open it is), so words over an item can fade as it shrinks, and{' '}
            <InlineCode>onFocalChange</InlineCode> names the item in the large place.
          </>,
          <>
            <InlineCode>controlPlacement=&quot;end&quot;</InlineCode> on{' '}
            <InlineCode>Switch</InlineCode>, <InlineCode>Checkbox</InlineCode>,{' '}
            <InlineCode>Radio</InlineCode> and <InlineCode>RadioGroup</InlineCode>: a settings row
            with its words at the start and its control at the end, the whole row being the label.
          </>,
          <>
            <InlineCode>valueText</InlineCode> on <InlineCode>Slider</InlineCode> and{' '}
            <InlineCode>RangeSlider</InlineCode> says the value in words for screen readers, such as
            a time; a screen reader&apos;s own change now calls <InlineCode>onChangeEnd</InlineCode>
            , as a key does.
          </>,
          <>
            <InlineCode>ThemeScope</InlineCode> takes <InlineCode>as=&quot;span&quot;</InlineCode>{' '}
            for content that takes only phrasing content, and{' '}
            <InlineCode>NextRouterProvider</InlineCode> takes the app&apos;s{' '}
            <InlineCode>basePath</InlineCode> and <InlineCode>trailingSlash</InlineCode>.
          </>,
          <>
            For sliders built on React Aria outside the library,{' '}
            <InlineCode>@windmorph/react/primitives</InlineCode> has the Slider&apos;s touch
            handling (<InlineCode>useSliderTouchTrack</InlineCode>) and its thumb helpers (
            <InlineCode>sliderThumbInputProps</InlineCode>,{' '}
            <InlineCode>sliderArrowRaises</InlineCode>).
          </>,
        ],
      },
      {
        title: 'One name for each idea',
        items: [
          <>
            Props that had two names now have the library&apos;s one:{' '}
            <InlineCode>heroAlign</InlineCode>, <InlineCode>verticalAlign</InlineCode> and{' '}
            <InlineCode>itemAlign</InlineCode>; <InlineCode>current</InlineCode> and{' '}
            <InlineCode>currentIcon</InlineCode> on navigation items, which mark the page the app is
            on; <InlineCode>onClose</InlineCode> on <InlineCode>Snackbar</InlineCode>; and{' '}
            <InlineCode>openDelay</InlineCode> on tooltip and submenu triggers. The old names still
            work, struck through in editors, and go in a later minor release.
          </>,
          <>
            A <InlineCode>Snackbar</InlineCode> given <InlineCode>onClose</InlineCode> now shows its
            close button: the name used to reach the page as an attribute and did nothing.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            Links inside a <InlineCode>RouterProvider</InlineCode> with a{' '}
            <InlineCode>useHref</InlineCode> (an app&apos;s base path) show the router&apos;s
            address, so a new tab, a copied link or a crawler reaches the right page.
          </>,
          <>
            Tooltips, menus, sheets and dialogs show while an element is in full screen, and stay
            put as full screen starts or ends. Closing an overlay gives focus back without passing
            through the page, and icon buttons in an overlay show their own tooltips again.
          </>,
          <>
            A modifier key pressed alone (Option on a Mac, Caps Lock anywhere) no longer shows the
            focus ring of a control a pointer focused; a screen reader&apos;s rings, and an invalid
            field&apos;s after a form check, stay.
          </>,
          <>
            Touch targets that overlapped are apart: a <InlineCode>RadioGroup</InlineCode>&apos;s
            options and a multiple <InlineCode>Autocomplete</InlineCode>&apos;s chip rows are 48px
            apart, top to top, and a scrolling <InlineCode>ChipSet</InlineCode> shows a focused end
            chip&apos;s whole ring.
          </>,
          <>
            Escape in an <InlineCode>Autocomplete</InlineCode> list inside a bottom sheet closes
            only the list. In a <InlineCode>Carousel</InlineCode>, Enter after a mouse drag
            activates the item, a drag that starts on a picture scrolls, and focus that comes back
            after a press leaves the carousel where it was. A touch on a{' '}
            <InlineCode>Slider</InlineCode> reads the slider as it is now.
          </>,
          <>
            The recipes run on tailwind-variants 4 with the same classes as before, and the library
            needs React Aria 3.53.1 and React Stately 3.51.0 or later.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>MediaTimeSlider</InlineCode>, a media player&apos;s position bar: a thin bar
            that grows under the pointer, the loaded ranges, a time bubble, the position in words,
            keys and a screen reader&apos;s step by <InlineCode>step</InlineCode> seconds, and a
            handle that holds where it was put until the seek lands. While it has focus, the time
            screen readers read stays still during playback.
          </>,
          <>
            <InlineCode>Avatar</InlineCode> and <InlineCode>AvatarGroup</InlineCode> take any size
            in px, or <InlineCode>--wm-avatar-size</InlineCode> from CSS, with a 48px touch target
            and a group&apos;s spacing that follow it; a rectangle <InlineCode>Skeleton</InlineCode>{' '}
            takes a <InlineCode>ratio</InlineCode>, standing for a picture before it loads.
          </>,
          <>
            Pro speaks the same names: <InlineCode>headingLevel</InlineCode>,{' '}
            <InlineCode>onFileAccept</InlineCode>, <InlineCode>loadingIndicator</InlineCode> and{' '}
            <InlineCode>endMessage</InlineCode>, <InlineCode>title</InlineCode> on{' '}
            <InlineCode>Popover</InlineCode> (now its header&apos;s text) and{' '}
            <InlineCode>NavigationRailGroup</InlineCode>, and <InlineCode>current</InlineCode> on a{' '}
            <InlineCode>SidePanelRailItem</InlineCode> link; the old names still work.
          </>,
          <>
            A <InlineCode>DataTable</InlineCode> row&apos;s link shows the router&apos;s address,
            and a focused link in collapsed <InlineCode>ExpandableText</InlineCode> keeps its whole
            ring.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.8',
    date: '2026-11-15',
    summary: (
      <>
        Two fixes to overlays inside overlays: a dialog or sheet placed inside one that a trigger
        opened keeps its own open state, and Escape in a dialog opened from a bottom sheet no longer
        closes the sheet behind it. In Windmorph Pro, <InlineCode>MediaGrid</InlineCode> picks the
        right file for its tiles and keeps the tile of a photo that can&apos;t be loaded.
      </>
    ),
    sections: [
      {
        title: 'Fixes',
        items: [
          <>
            A <InlineCode>Dialog</InlineCode> inside the content of a dialog that a{' '}
            <InlineCode>DialogTrigger</InlineCode> opened keeps its own open state. It took the
            trigger&apos;s, so it opened together with the outer dialog, each made the other inert,
            and nothing in either could take focus or be pressed. A form&apos;s own dialog (an
            &quot;Add a link&quot;, a &quot;Discard changes?&quot;) now stays closed until its{' '}
            <InlineCode>open</InlineCode> says so, and closes alone. A modal{' '}
            <InlineCode>BottomSheet</InlineCode> or <InlineCode>SideSheet</InlineCode> inside a
            sheet that a <InlineCode>SheetTrigger</InlineCode> opened does the same, and so does a{' '}
            <InlineCode>Menu</InlineCode> or <InlineCode>Select</InlineCode> shown as a sheet there.
          </>,
          <>
            Escape pressed in a dialog or sheet opened from inside a{' '}
            <InlineCode>BottomSheet</InlineCode> no longer closes the bottom sheet behind it. The
            sheet took the key from an overlay inside it that doesn&apos;t close on Escape (
            <InlineCode>closedBy=&quot;none&quot;</InlineCode>, a dialog while it saves). Escape
            that cancels a text being composed is left to the input method too.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>MediaGrid</InlineCode> loads the smallest file that fills a tile when its
            photos are stored at several widths (<InlineCode>srcSet</InlineCode>). The tile&apos;s
            image had no <InlineCode>sizes</InlineCode>, so a browser took each tile to be as wide
            as the window and loaded the largest file. The grid now says how wide a tile shows from
            its own layout, and takes <InlineCode>sizes</InlineCode> for a grid narrower than the
            window.
          </>,
          <>
            A <InlineCode>MediaGrid</InlineCode> tile whose photo can&apos;t be loaded keeps its
            square, in a container colour with an icon (<InlineCode>fallbackIcon</InlineCode>),
            where the browser drew its broken-picture icon and the alt text. It is still a button
            named by the photo&apos;s <InlineCode>alt</InlineCode> and still calls{' '}
            <InlineCode>onAction</InlineCode>; a failure is noticed in the server&apos;s HTML too,
            and a photo with no address shows the placeholder at once.
          </>,
          <>
            A link <InlineCode>Avatar</InlineCode> takes <InlineCode>target</InlineCode>,{' '}
            <InlineCode>rel</InlineCode> and <InlineCode>download</InlineCode>, as an{' '}
            <InlineCode>&lt;a&gt;</InlineCode> does. With{' '}
            <InlineCode>target=&quot;_blank&quot;</InlineCode> its <InlineCode>rel</InlineCode>{' '}
            always holds <InlineCode>noopener noreferrer</InlineCode>, and its name says it opens in
            a new tab.
          </>,
          <>
            <InlineCode>ExpandableText</InlineCode> no longer shows &quot;See more&quot; on text
            that isn&apos;t cut. One line holding a standalone <InlineCode>Link</InlineCode> showed
            the button, and pressing it changed nothing: the link&apos;s 48px touch target was
            counted as text. The text itself is now measured.
          </>,
          <>
            A <InlineCode>stacked</InlineCode> <InlineCode>ReactionSummary</InlineCode> follows{' '}
            <InlineCode>size</InlineCode> as <InlineCode>ReactionPicker</InlineCode> does: its
            pressable button is the picker&apos;s height and padding (32px and 8px at{' '}
            <InlineCode>sm</InlineCode>) and its count takes the picker&apos;s label type, so a
            summary beside a picker neither stands taller nor moves the row as it appears.
          </>,
          <>
            A <InlineCode>Popover</InlineCode> inside the content of a popover that a{' '}
            <InlineCode>PopoverTrigger</InlineCode> opened keeps its own open state, as the
            core&apos;s dialogs and sheets now do. With this core, a{' '}
            <InlineCode>RichMessageField</InlineCode> works inside a dialog its trigger opened: its
            own link dialog used to open with it.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.7',
    date: '2026-11-14',
    summary: (
      <>
        Fixes from an audit of the chips, the overlays and the pickers: a date picker dialog saves
        the day Enter is pressed on, a dialog opened from a group or a bar is no longer part of it,
        and a chip with a remove button behaves as one chip. In Windmorph Pro,{' '}
        <InlineCode>Avatar</InlineCode> takes a status ring.
      </>
    ),
    sections: [
      {
        title: 'Fixes',
        items: [
          <>
            Enter on a day in a date picker dialog saves that day. The day was picked only when the
            key was let go, after the dialog had saved, so a <InlineCode>PickerDialog</InlineCode>{' '}
            around a <InlineCode>DatePicker</InlineCode> or a{' '}
            <InlineCode>DateRangePicker</InlineCode>, and a <InlineCode>DateField</InlineCode>
            &apos;s full-screen dialog, closed with the date picked before.
          </>,
          <>
            A dialog, menu or sheet opened from a <InlineCode>ButtonGroup</InlineCode>, a{' '}
            <InlineCode>ChipSet</InlineCode>, a toolbar, an app bar or a search bar is no longer
            part of it. Its buttons took the group&apos;s size, corners and{' '}
            <InlineCode>disabled</InlineCode>, its chips were selected and disabled with the set,
            its tooltips opened below as in the bar, and Tab inside it was pulled back to the
            group&apos;s selected button. One thing to check: an icon button in an overlay opened
            from a toolbar, an app bar or a search bar is filled again, as anywhere else on the
            page; pass <InlineCode>variant=&quot;standard&quot;</InlineCode> to keep it plain.
          </>,
          <>
            A chip with a remove button behaves as one chip. A press on the end of its label no
            longer removes it: the remove target stops where the label ends. What is about the whole
            chip (<InlineCode>data-*</InlineCode>, <InlineCode>hidden</InlineCode>,{' '}
            <InlineCode>inert</InlineCode>, dragging) goes on the chip, not on the button inside it;
            the focus indicator is drawn round the chip, so an{' '}
            <InlineCode>overflow-hidden</InlineCode> class can&apos;t cut it off; and a menu or
            tooltip trigger around the chip wires up its main button only, never Remove.
          </>,
          <>
            A <InlineCode>FilterChip</InlineCode> keeps its selection and keyboard focus when{' '}
            <InlineCode>onRemove</InlineCode> is added or taken away, as an app does to show the
            remove button only on wider windows.
          </>,
          <>
            A <InlineCode>ChipSet</InlineCode> with <InlineCode>disabled</InlineCode> disables every
            chip in it, whatever its kind; before, only the filter chips taking part in a selection
            were. It calls <InlineCode>onSelectionChange</InlineCode> only when the selection
            changes, and in a scrolling set the arrow keys bring the whole chip into view.
          </>,
          <>
            An <InlineCode>InputChip</InlineCode> with only <InlineCode>onPress</InlineCode> shows
            its hover, focus and pressed states; it showed none.
          </>,
          <>
            An outlined field&apos;s floated label sits in the middle of its notch, with 4px on each
            side, at both of the outline&apos;s widths. It applies to{' '}
            <InlineCode>TextField</InlineCode>, <InlineCode>Select</InlineCode>,{' '}
            <InlineCode>Autocomplete</InlineCode>, <InlineCode>DateField</InlineCode> and{' '}
            <InlineCode>TimeField</InlineCode>. Under reduced motion the outline changes width at
            once.
          </>,
          <>
            Enter or Space held long enough to repeat acts once: on a time picker&apos;s dial the
            repeat picked a minute after the hour, in a search bar it submitted the query as the
            view opened, and on a bottom sheet&apos;s drag handle it went on to the next size.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>Avatar</InlineCode> takes a status ring:{' '}
            <InlineCode>statusRing=&quot;active&quot;</InlineCode> for something to see about the
            account (something new from it, a broadcast under way, the person speaking) and{' '}
            <InlineCode>&quot;inactive&quot;</InlineCode>, thinner and quieter, for nothing new.{' '}
            <InlineCode>statusRingLabel</InlineCode> says what it means in the avatar&apos;s
            accessible name. The ring is drawn outside the avatar, which keeps its size, follows its
            shape, and takes a colour or a gradient from its tokens.
          </>,
          <>
            The ring can be cut into segments, one for each thing there is to see:{' '}
            <InlineCode>statusRingSegments</InlineCode>, with{' '}
            <InlineCode>statusRingInactiveSegments</InlineCode> for the ones already seen.
          </>,
          <>
            <InlineCode>badgePlacement=&quot;bottom&quot;</InlineCode> puts the badge on the
            avatar&apos;s bottom edge as a pill, for a short word such as &quot;LIVE&quot;.
          </>,
          <>
            In an <InlineCode>AvatarGroup</InlineCode>, the avatar that holds keyboard focus is
            drawn above the rest, so nothing covers its focus indicator; an avatar in a hover card
            opened from the group is no longer part of it; and your own link around an avatar is
            named by the avatar&apos;s <InlineCode>alt</InlineCode> in the server&apos;s HTML too.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.6',
    date: '2026-11-13',
    summary: (
      <>
        Touch targets, and a page that is a pane scrolling by itself: every chip in a wrapping set
        keeps its 48px target, and the two scroll hooks hold up beside a side panel, on pages laid
        out without the pane and on pages that arrive slowly.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            A wrapping <InlineCode>ChipSet</InlineCode> puts 16px between its rows instead of 8px
            (20px and 24px as <InlineCode>density</InlineCode> makes the chips smaller), so every
            chip takes presses over its full 48px touch target. At 8px the targets of two rows
            overlapped, and a chip with another under it was left with 40px. Chips in a row stay 8px
            apart, and a <InlineCode>gap-y-*</InlineCode> class brings the rows closer again.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            <InlineCode>useScrollKeys</InlineCode> and <InlineCode>useScrollRestoration</InlineCode>{' '}
            follow the element behind their ref, so a frame can leave its pane out on some pages, or
            put another in its place. Before, the scroll keys kept going to the pane that had left,
            and going back from a page without the pane left it at its top.
          </>,
          <>
            <InlineCode>useScrollKeys</InlineCode> leaves the scroll keys with another scrolling
            element the person last pressed in, such as a side sheet&apos;s content, which is where
            the browser sends them. The pane is a Tab stop by what Tab can really reach: a hidden
            input, or a control in an inert part, no longer takes the stop from a page of text.
          </>,
          <>
            <InlineCode>useScrollRestoration</InlineCode> keeps a page&apos;s position through a
            slow return to it: going back again, or pressing a link, before the page was tall enough
            to reach its position no longer replaces what was kept. A reload restores only the page
            that was reloaded.
          </>,
          <>
            Leaving a scrolling <InlineCode>ChipSet</InlineCode> with Tab no longer scrolls its row
            to the far end.
          </>,
          <>
            A <InlineCode>TimePicker</InlineCode>&apos;s dial numbers are named as they are shown
            (&quot;05 minutes of 60&quot;), so someone who speaks to the page can ask for the number
            as it is written.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.5',
    date: '2026-11-12',
    summary: (
      <>
        <InlineCode>LocaleProvider</InlineCode>, one place to set the language dates, times and
        numbers are written in; in Windmorph Pro, <InlineCode>ConfirmDialog</InlineCode>, one dialog
        for &quot;are you sure?&quot;.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>LocaleProvider</InlineCode> sets the locale of every component below it: the
            order of a date, the 12- or 24-hour clock, digits and the first day of the week. Without
            it the components still follow the browser&apos;s language, which may not be the
            page&apos;s: an English page in a British browser got 24-hour time fields. Pass the
            page&apos;s language, the same on the server and in the browser.
          </>,
          <>
            <InlineCode>useLocale</InlineCode> returns the locale and its direction, for your own
            formatting, so your dates match the fields beside them.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>ConfirmDialog</InlineCode>, one dialog for &quot;are you sure?&quot;: a
            question, what will happen, and two actions. Focus starts on Cancel, nothing closes it
            while the action runs, and a failure stays inside it with focus on the action, so Enter
            tries again. The action can return a promise, which sets the pending state by itself.
          </>,
          <>
            <InlineCode>ConfirmDialogActions</InlineCode>, the same row of actions as a part, for a
            form in a <InlineCode>Dialog</InlineCode>: Cancel, then one acting button that can
            submit and shows that it&apos;s working.
          </>,
          <>
            Pro&apos;s components follow <InlineCode>LocaleProvider</InlineCode> too.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A <InlineCode>DateField</InlineCode>, and the date pickers&apos; text input, write their
            text again when the locale changes. A server-rendered field moves from the server&apos;s{' '}
            <InlineCode>en-US</InlineCode> to the browser&apos;s language by itself, and kept{' '}
            <InlineCode>03/05/2030</InlineCode>, which a day-first browser then read as 3 May
            instead of 5 March when the field lost focus.
          </>,
          <>
            <InlineCode>Dialog</InlineCode> no longer takes <InlineCode>isEntering</InlineCode>, an
            option React Aria 3.53 added to the type its props extend; it did nothing.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.4',
    date: '2026-11-12',
    summary: (
      <>
        <InlineCode>LabelsProvider</InlineCode>, one place to translate the words components show or
        announce by themselves, and a <InlineCode>TimeField</InlineCode> that can open a list of
        times under the field; in Windmorph Pro, every component reads the same provider.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>LabelsProvider</InlineCode> sets the built-in words (&quot;Close&quot;,
            &quot;Error&quot;, the character count) for every component below it, keyed by
            component, so an app in another language writes them once. A component&apos;s own{' '}
            <InlineCode>labels</InlineCode> still wins, and <InlineCode>useLabels</InlineCode> reads
            the provider from a component of your own.
          </>,
          <>
            <InlineCode>TimeField</InlineCode> takes{' '}
            <InlineCode>presentation=&quot;docked&quot;</InlineCode>: on windows 600px wide or more
            its clock opens a list of times under the field, every half hour or every{' '}
            <InlineCode>step</InlineCode> minutes, for forms with many times. Narrower windows keep
            the dialog, and any time can still be typed.
          </>,
          <>
            <InlineCode>useScrollRestoration</InlineCode> and <InlineCode>useScrollKeys</InlineCode>
            , for a page that is a pane scrolling by itself, as in the app frame block: the
            pane&apos;s position comes back on back, forward and reload, and the scroll keys reach
            it while nothing has focus.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            Every component with <InlineCode>labels</InlineCode> reads{' '}
            <InlineCode>LabelsProvider</InlineCode> too, so Pro&apos;s words are translated in the
            same place as the core&apos;s.
          </>,
          <>
            <InlineCode>ShapedIcon</InlineCode> and <InlineCode>EmptyState</InlineCode> take{' '}
            <InlineCode>color=&quot;success&quot;</InlineCode> and{' '}
            <InlineCode>color=&quot;warning&quot;</InlineCode>, so an empty state that says
            &quot;all done&quot; can be green.
          </>,
          <>
            A <InlineCode>PhoneField</InlineCode> can be named by{' '}
            <InlineCode>aria-labelledby</InlineCode> alone, as the core&apos;s fields can.
          </>,
          <>
            A <InlineCode>ListDetailLayout</InlineCode> inside a pane that scrolls by itself can be
            told the height it has, so its list stays in view as the detail scrolls.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A selected <InlineCode>Menu</InlineCode> item&apos;s tick, icons and description follow
            the selected label&apos;s colour token, in <InlineCode>Select</InlineCode> and{' '}
            <InlineCode>Autocomplete</InlineCode> lists too, so an app that sets the selected
            colours no longer gets a tick in the old one.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.3',
    date: '2026-11-11',
    summary: (
      <>
        <InlineCode>MenuItem</InlineCode> links, and fixes for sliders named by a visible label,
        long text in fields, pressed buttons with an app&apos;s own animation and images in a
        rail&apos;s header; in Windmorph Pro, avatars that keep their size.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            A <InlineCode>MenuItem</InlineCode> with <InlineCode>href</InlineCode> is a real link:
            it opens in a new tab and its address can be copied, <InlineCode>download</InlineCode>{' '}
            saves the file, and following it closes the menu.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            An <InlineCode>Avatar</InlineCode> showing a photo keeps its size wherever it&apos;s
            placed, so a large logo in a rail&apos;s header no longer covers the rail.
          </>,
          <>
            In an expanded or modal rail, a <InlineCode>NavigationRailGroup</InlineCode>&apos;s
            label matches the rail&apos;s other labels instead of reading as a heading.
          </>,
          <>
            A <InlineCode>DataTable</InlineCode>&apos;s compact rows break a long word, such as an
            email address, before the row&apos;s actions.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A <InlineCode>Slider</InlineCode> or <InlineCode>RangeSlider</InlineCode> named with{' '}
            <InlineCode>aria-labelledby</InlineCode> names each thumb by that label, not by its
            value.
          </>,
          <>
            A hint or value longer than a <InlineCode>TextField</InlineCode>,{' '}
            <InlineCode>Autocomplete</InlineCode>, <InlineCode>SearchField</InlineCode> or{' '}
            <InlineCode>SearchBar</InlineCode> ends in an ellipsis instead of being cut off
            mid-letter.
          </>,
          <>
            Pressing a button no longer changes the timing of a transition an app adds through{' '}
            <InlineCode>className</InlineCode>, or cuts it short.
          </>,
          <>
            Content in a <InlineCode>NavigationRail</InlineCode>&apos;s header keeps its own size:
            an image no longer grows to its natural width, and text stays on one line.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.2',
    date: '2026-11-10',
    summary: (
      <>
        <InlineCode>SearchField</InlineCode>, a search box that filters what&apos;s on the screen,
        and fixes for components first shown out of sight or set against the window&apos;s edge; in
        Windmorph Pro, <InlineCode>DataTable</InlineCode> columns that fit their content.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>SearchField</InlineCode> filters a page, a list or a table in place, drawn
            as the search bar&apos;s pill and filling its container. It never opens a search view:
            Escape clears it, Enter submits, and a clear button shows while there&apos;s text. It
            takes <InlineCode>density</InlineCode> like the other fields.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>DataTable</InlineCode> columns take{' '}
            <InlineCode>width: &apos;fit&apos;</InlineCode>, sizing to the widest of their header
            and values, so translated text isn&apos;t cut short. A person&apos;s resize still wins,
            and a double-click on a resize handle (or R, then Enter) fits any column.
          </>,
          <>
            A <InlineCode>DataTable</InlineCode> or <InlineCode>DataGrid</InlineCode>&apos;s last
            row no longer draws a second line against the outline.
          </>,
          <>
            A hidden <InlineCode>SidePanelRail</InlineCode> on the window&apos;s edge no longer
            scrolls the page sideways, and the message fields&apos; tool rows no longer cut their
            buttons&apos; focus rings.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            An expanded <InlineCode>NavigationRail</InlineCode> sizes itself to its labels exactly,
            measures again once fonts load or a hidden rail shows, and no longer springs open as the
            page loads.
          </>,
          <>
            A growing <InlineCode>TextField</InlineCode> first rendered out of sight keeps its
            height once shown, and a <InlineCode>DateRangePicker</InlineCode> opens on its
            range&apos;s month.
          </>,
          <>
            A switch <InlineCode>ListItem</InlineCode> that&apos;s on stays plain, as a settings
            row, with only its switch showing the state; checkbox and radio items keep the fill, and{' '}
            <InlineCode>selectedWhenChecked</InlineCode> picks either look.
          </>,
          <>
            A carousel item&apos;s focus ring is drawn inside it, so the first and last items&apos;
            rings are whole, and a collapsed toolbar by the window&apos;s edge no longer scrolls the
            page sideways.
          </>,
        ],
      },
    ],
  },
  {
    version: '0.2.1',
    date: '2026-11-10',
    summary: (
      <>
        Navigation labels and theme changes as M3 Expressive draws them, a close icon an app can
        replace, and Windmorph Pro&apos;s <InlineCode>SidePanelRail</InlineCode>, with the Blocks
        section&apos;s app frame to build from.
      </>
    ),
    sections: [
      {
        title: 'Components',
        items: [
          <>
            <InlineCode>DialogHeader</InlineCode> takes <InlineCode>closeIcon</InlineCode>, to
            replace the full-screen close button&apos;s icon, as <InlineCode>SideSheet</InlineCode>{' '}
            and <InlineCode>BottomSheet</InlineCode> do.
          </>,
          <>
            A standard <InlineCode>SideSheet</InlineCode> takes{' '}
            <InlineCode>classNames.frame</InlineCode>, the box holding a detached sheet&apos;s
            margins, so an app can change the gap on one side.
          </>,
        ],
      },
      {
        title: 'Windmorph Pro',
        items: [
          <>
            <InlineCode>SidePanelRail</InlineCode>, a strip of icon links or buttons at the
            window&apos;s end edge that hides to a small tab and can open a standard{' '}
            <InlineCode>SideSheet</InlineCode> beside the page.
          </>,
          <>
            <InlineCode>NavigationRailGroup</InlineCode> keeps one panel per rail, replacing its
            content as the pointer moves between destinations, and folds without a bounce.
          </>,
          <>
            <InlineCode>classNames</InlineCode> keys for every inner part of the data and navigation
            components, replaceable close and expand icons, and tokens for their remaining fixed
            widths and opacities.
          </>,
        ],
      },
      {
        title: 'Fixes',
        items: [
          <>
            A current <InlineCode>NavigationRail</InlineCode> or{' '}
            <InlineCode>NavigationBar</InlineCode> label keeps its regular weight, as M3 Expressive
            specifies; only its colour changes.
          </>,
          <>
            Changing the theme, mode or contrast through <InlineCode>ThemeProvider</InlineCode>{' '}
            updates every control at once, where buttons and other controls used to fade behind the
            page.
          </>,
          <>
            A disabled <InlineCode>Button</InlineCode> or <InlineCode>IconButton</InlineCode> link
            keeps <InlineCode>role=&quot;link&quot;</InlineCode> once its{' '}
            <InlineCode>href</InlineCode> is gone, so assistive technology still reads its name.
          </>,
        ],
      },
    ],
  },
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
