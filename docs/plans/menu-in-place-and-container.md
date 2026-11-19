# Menu: submenus in place, and an element to open in

Status: **approved 2026-11-18** (for 0.2.11), with every recommendation in "Open questions" and two additions: `submenuTransition` (a fade or M3's forward and backward slide between pages) and `afterSelect` (a choice on a submenu goes back instead of closing the menu). **Built 2026-11-18**; what the browser showed, and what changed from the plan because of it, is in "Risks" (each marked verified, or found while building) and in decisions 5 and 10.

## The gap

- **A popover's submenu always opens beside its item.** `SubmenuTrigger`'s TSDoc says "It opens beside the item, without covering it", and `Menu`'s `placement` says "A submenu always opens beside its item". The content is replaced in place only in the bottom sheet (`presentation="sheet"`, or `"auto"` below 600px), through `SubmenuSheetPanel` in `Menu.tsx`.
- **The popover always opens where `Overlay` puts it.** That is an app's React Aria `UNSAFE_PortalProvider` container, else the element in full screen, else `body`. `Menu` passes no container of its own, and React Aria keeps the menu within the window (`boundaryElement` defaults to `document.body`).
- **An app can wrap its player in `UNSAFE_PortalProvider` today, but:**
  - React Aria marks the provider unsafe.
  - It moves every overlay below it (tooltips, dialogs) into the player.
  - The window stays the menu's boundary, so the menu can be placed past the player's edges, where the player's `overflow: hidden` cuts it off.
  - In such a container, `Overlay` writes every theme attribute, so the app's own `:root` token values never reach the menu (architecture §5, "Only the attributes that differ").
- **The use case: a video player's settings menu.**
  - It opens over the picture from the settings button in the player's bottom end corner, moves with the player, and stays inside it in full screen.
  - A row with a submenu (Quality, Playback speed) replaces the content in the same surface, below a back row ("‹ Quality"). Back returns to the first page.
  - The surface keeps its corner and its place, and its height follows each page.

## Research

### M3

Read on 2026-11-18 through a headless browser, since m3.material.io renders client-side.

- **[Menus, guidelines](https://m3.material.io/components/menus/guidelines):**
  - "Submenus should open next to the parent menu item without overlapping it."
  - "Submenus are best used on large screens where there's space. See adaptive guidance for alternatives on mobile."
  - "Consider adapting menus into bottom sheets on small screens."
  - "Submenus are not currently available on Jetpack Compose."
  - M3, Expressive included, defines no in-place submenu and no back row. `replace` is an extension of the spec, and the docs site lists it as one.
- **[Menus, accessibility](https://m3.material.io/components/menus/accessibility):**
  - "When a menu opens, focus should be placed on the first menu item."
  - Left and Right arrows: "Opens or closes a submenu".
  - Escape: "Closes menu".
- **[Transition patterns](https://m3.material.io/styles/motion/transitions/transition-patterns) and [applying transitions](https://m3.material.io/styles/motion/transitions/applying-transitions):**
  - The forward and backward pattern is "used for navigating between screens at consecutive levels of hierarchy", with "a horizontal sliding motion", and "Android uses a fade as screens slide".
  - "A transition should have a unified direction of movement … move along a primary axis".
  - "Fully fade out content before fading new content in".
  - "Common transitions should not use overt style effects like bouncy springs".
  - "If pure efficiency is a top priority, like opening a menu in a productivity app, a jump cut may be preferred".
  - Under a reduced-animation setting, transitions should "Use subtle fades instead of intense sliding or scaling animations".

### React Aria

Version 3.53.1 is the core's version and the latest on npm. React Aria Components is at 1.22.1. Docs and the installed package's code were read on 2026-11-18.

- **Portals:**
  - [`UNSAFE_PortalProvider`](https://react-aria.adobe.com/PortalProvider)'s `getContainer` sets the container for "Modals, Popovers, Toasts, and Tooltips". It's marked unsafe because some portal locations may not work for styling or accessibility.
  - React Aria Components' `Popover` `UNSTABLE_portalContainer` is "@deprecated - Use a parent UNSAFE_PortalProvider" ([types, 1.22.1](https://cdn.jsdelivr.net/npm/react-aria-components@1.22.1/dist/types/src/Popover.d.ts)).
  - The hook-level `Overlay` takes `portalContainer`, as the core's `Overlay` primitive does.
- **Placement** ([`Popover`](https://react-aria.adobe.com/Popover); `dist/private/overlays/useOverlayPosition.mjs` and `calculatePosition.mjs` in the package):
  - `boundaryElement` is the "Element that serves as the positioning boundary", by default `document.body`.
  - The menu keeps `containerPadding` (12px) from that boundary. It flips to the other side when that side has more room, shifts along the cross axis to stay inside, and caps its height at the boundary and the visual viewport.
  - The popover is `position: absolute` against its containing block, found from `offsetParent` and from ancestors with `transform`, `filter`, `contain: paint`, `will-change` or `backdrop-filter`. Inside a positioned container it moves with the container, with no script.
  - It is placed again on a window resize, a visual-viewport resize, and a change in its own size or its trigger's size. It is not placed again on scroll. `usePopover` doesn't return the `updatePosition` that `useOverlayPosition` has.
- **Modal and non-modal:** a modal popover locks the page's scroll (`usePreventScroll`: `overflow: hidden` on `<html>`) and makes the rest of the page inert. A non-modal one closes as soon as an ancestor of its trigger scrolls, the document included (`useCloseOnScroll`).
- **Submenus** ([Menu](https://react-aria.adobe.com/Menu); `useSubmenuTrigger.mjs`):
  - A submenu is keyed by its item's key, in the root state's `expandedKeysStack` (`useSubmenuTriggerState`).
  - In a submenu, Escape and the back arrow (Left, or Right in right-to-left) close only that submenu and focus its item. The submenu's `onClose` is `closeAll`.
  - The docs show submenus as popovers only. React Aria offers nothing for drill-in.
- **First focus:** `useSelectableCollection` focuses the first selected item as a menu opens, else the first item.
- **Sections:** each `MenuSection` "may have independent selection states" (the core's `MenuGroup` selection, on this branch).

### Other libraries

| Library | Element to open in | Submenus |
|---|---|---|
| [Radix Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) | `Portal` `container` (`HTMLElement`, default `document.body`) | Beside, opened and closed with the arrows by reading direction; no drill-in |
| [Base UI Menu](https://base-ui.com/react/components/menu) | `Menu.Portal` `container` (an element, shadow root or ref); the positioner's `collisionBoundary` (default `'clipping-ancestors'`) and `collisionPadding` (5) | Beside (`inline-end`); `closeParentOnEsc`; no drill-in |
| [Spectrum Web Components Menu](https://cdn.jsdelivr.net/npm/@spectrum-web-components/menu@1.12.0/src/Menu.d.ts) | — | `mobileView`: "tapping a submenu item replaces the current menu content", with `mobileBackLabel`, a slide-in and the back button focused; closing a level refocuses the previous back button or the item that opened it |
| React Aria Components | `UNSAFE_PortalProvider`; `boundaryElement` on `Popover` | Beside only |

- The element to open in is a prop on the overlay, named for the container, or a provider.
- The boundary is separate from it in both React Aria and Base UI.
- Where drill-in exists, it's a mode of the same menu, with a back row and focus that goes back one level at a time.

### Full screen and fixed positioning

- **The [Fullscreen spec](https://fullscreen.spec.whatwg.org/):**
  - Going full screen adds the element to the top layer.
  - The UA style sheet gives it `position: fixed !important`, `inset: 0 !important`, `transform: none !important` and a 100% width and height, and its `::backdrop` is black.
  - The viewport resizes to the screen on entering full screen, and back on leaving.
- **MDN:** the [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer) "spans the entire width and height of the viewport and sits on top of all other layers". An overlay in `body` therefore sits under the element in full screen and its backdrop, and isn't seen.
- **The core already opens overlays inside the element in full screen** (2026-11-15, §3). It reads that element once, as the overlay opens, and keeps the overlay there (2026-11-16). So a menu opened before the player goes full screen stays in `body`, out of sight.
- **[MDN, containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block):**
  - `fixed` is placed against the viewport, unless an ancestor has one of: `transform`, `translate`, `rotate`, `scale` or `perspective`; `filter` or `backdrop-filter`; `contain: layout`, `paint`, `strict` or `content`; a `will-change` of one of those; or `content-visibility: auto`.
  - `absolute` is placed against the nearest positioned ancestor, or an ancestor of that kind.
  - The element in full screen is `position: fixed` with no transform. Its absolute children are placed against it. Its fixed children are placed against the viewport, which it fills.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | In-place submenus | `submenuPresentation: 'beside' \| 'replace'` on the root `Menu`, default `'beside'`; submenus follow the root's, as with `presentation` and `instant` |
| 2 | Where it applies | Popovers only. A sheet always replaces (no change). `presentation="auto"` replaces below 600px (in the sheet) and follows `submenuPresentation` from 600px up. `submenuTransition` applies wherever pages replace each other: the popover with `replace`, and the sheet |
| 3 | One implementation | The sheet's submenu page becomes the shared page for both presentations (see "Shared with the sheet") |
| 4 | One surface | In place, the pages sit on one surface that persists from page to page (the `divider` layout's: colour, corners, elevation and 4px padding from the menu's tokens). `layout="gap"` gives way to dividers, as in a sheet and in a `gap` menu that scrolls; M3: "On web, use a divider to separate menu items". Pages take the root's `variant` and `layout`, in a popover and in a sheet (2026-11-19: the sheet took a page's own variant), so all of a menu's pages share one variant and a page never looks different from the one that opened it; a page's own `density`, selection, `onAction` and `classNames` still apply, and its `className` and `style` go on its page (2026-11-19: they went nowhere) |
| 5 | Height | The surface's height follows the visible page. It grows on the default spatial spring and shrinks over the same duration on the default effects spring's easing, so a shorter page is never cut and the surface never bounces open again (as the toolbar's collapsible content, §9). It's measured by `usePageHeight`: as each page goes in, in the same commit, and on any other resize (built: `useNaturalSize` measures only in a `ResizeObserver` callback, a frame after the page, and can't tell a page change from a font arriving) |
| 6 | Width | Each page takes its own width (112–280px) at once. Only the height moves, so the change runs along one axis, as M3 asks |
| 7 | Page motion | `submenuTransition?: 'fade' \| 'slide'` on the root `Menu`, default `'fade'`. `fade`: the outgoing page goes at once and the incoming one fades in on the fast effects spring, as the sheet's pages do today. `slide`: M3's forward and backward pattern, the incoming page sliding 30px in from the end edge going forward and from the start edge going back (mirrored in right to left) on the default spatial spring while it fades in; the outgoing page still goes at once. The first page never moves as the menu opens. Under reduced motion the slide drops (spatial durations are 0ms) and the fade stays; `instant` drops both |
| 8 | Corner and side held | While a page other than the first is open, the popover keeps the side and alignment it opened with (React Aria's placement is held at the side it resolved, with flipping off). A taller page grows away from the trigger and scrolls if it runs out of room; it never jumps across the trigger mid-change |
| 9 | Element to open in | `portalContainer?: Element \| null` on `Menu` (the root); `null` or left out keeps today's order |
| 10 | Boundary | The `portalContainer` is also React Aria's boundary, for the popover and for the submenus beside it, so they flip, shift and cap their height within it, `containerPadding` from its edges. A `PortalProvider`'s container is only a place to portal into, never a boundary (an app's portal root is often a zero-height `div` at the end of `body`). Built: React Aria gets a stand-in for it, since its own arithmetic is off in a positioned container (see "Risks") |
| 11 | Theme in a container | `Overlay` treats a container the app names (`portalContainer`, or a `PortalProvider`'s) as it treats the element in full screen. Its wrapper carries only the theme attributes that differ from those in effect there, so the app's `:root` values reach the menu. A container in another document keeps every attribute |
| 12 | Placed again on resize | While open, the menu watches its `portalContainer` (`ResizeObserver`) and is placed again when the container resizes without the window. React Aria misses that case (see "Risks" for how) |
| 13 | New parts | `classNames.header`, `back` and `title` for the row above a page (in the sheet too, which has no keys for them today); `backIcon` on the root `Menu`, as on `SideSheet` |
| 14 | Tokens | No new tokens. The surface reads the menu's (`--md-comp-menus-*`). The header's title and back icon read the items' label and leading-icon tokens, so `vibrant` and token overrides reach them |
| 15 | Modality | The menu stays modal (React Aria's default for menus): the page is inert, and its scroll is locked while the menu is open. A non-modal popover would close on any page scroll |
| 16 | After a choice | `afterSelect?: 'close' \| 'back'` on a submenu's `Menu` (the one inside `SubmenuTrigger`), default `'close'` (as before). `back`: a choice on a single-choice page (the page's own, or a single-choice `MenuGroup` on it) goes back one page instead of closing the menu, and the page it returns to shows the new choice, with focus on the item that opened the page. Beside, it closes only that submenu and focuses its item. Space keeps the page open either way, a toggle in a `multiple` page never closes it, and an action (a plain item) still closes the whole menu |
| 17 | Loading (2026-11-18, after the build) | The sheet's menu, pages in place and the `portalContainer` code load on demand, in one module (`menu-in-place.tsx`), the first time a menu that uses them opens, as the bottom sheet already did: preloaded when the browser is idle and on the trigger's hover or focus; opened before it's in, the menu shows nothing and its trigger keeps focus, then it opens placed and focused in the same pass. A menu whose submenus open beside it, in `body`, never loads it. Closed before it's in, the menu never shows; a failed load closes it and the next open tries again (2026-11-19); a menu its app holds open (a controlled `open` with no `onOpenChange`), which the close can't change, tries again after a pause, 1s doubling to 30s, reporting the failure once. A sheet menu runs only the sheet's loader (both load the one module, so the download is the same; the popover's ran too and reported a failure twice) and starts loading the bottom sheet's code with it, not after it |

## API

| Prop | On | Type | Default | Why this name |
|---|---|---|---|---|
| `submenuPresentation` | `Menu` (root) | `'beside' \| 'replace'` | `'beside'` | Follows `presentation` (`Menu`, `Select`, `FabMenu`). `beside` repeats M3's "next to the parent menu item" and the current TSDoc; `replace` says what happens to the content. Rejected: `inline` (sounds like rows expanding within the list), a `drillIn` boolean (leaves no room for a third way) |
| `portalContainer` | `Menu` (root) | `Element \| null` | — | The name of the core's `Overlay` prop and of React Aria's `Overlay` prop; React Aria Components' deprecated `UNSTABLE_portalContainer`; Radix's and Base UI's `Portal` `container`. Not just `container`, which `containerPadding` already uses for the boundary. On `Menu`, beside `placement`, `offset` and `containerPadding`, since the trigger holds only the open state. An element, not a ref, like the `Overlay` prop and React Aria's `getContainer`; apps pass it from a callback ref kept in state |
| `submenuTransition` | `Menu` (root) | `'fade' \| 'slide'` | `'fade'` | What the motion is, as a `transition`; `slide` is M3's forward and backward pattern, `fade` the sheet's motion today |
| `afterSelect` | a submenu's `Menu` | `'close' \| 'back'` | `'close'` | What follows a choice; `back` names where focus goes. On the submenu, since each page decides (Quality goes back, an action page closes) |
| `backIcon` | `Menu` (root) | `ReactElement` | Material Symbols `arrow_back`, mirrored in right-to-left | `SideSheet`'s name and type |
| `labels.back` | `Menu` (root) | `string` | `"Back"` | Unchanged; its TSDoc now covers the popover too |
| `classNames.header` / `back` / `title` | `Menu` | `string` | — | `SideSheet`'s keys for the same row |

- `MenuSubmenuPresentation`, `MenuSubmenuTransition` and `MenuAfterSelect` are exported beside `MenuPresentation`.
- **TSDoc that changes:**
  - `Menu`: it opens in `body` or in `portalContainer`.
  - `placement`: a submenu opens beside its item, or in its place.
  - `containerPadding`: measured from the window, or from the `portalContainer`.
  - `labels` and `classNames.panel`: with `replace`, `panel` is the surface that holds the pages.
  - `SubmenuTrigger`: hover doesn't open a submenu shown in place.
- **State:** the surface carries `data-level` (0 on the first page, then one more per page). Each page keeps its `data-submenu-panel`.

```tsx
const [player, setPlayer] = useState<HTMLDivElement | null>(null);

<div ref={setPlayer} className="relative aspect-video overflow-hidden">
  {/* the video and its controls */}
  <MenuTrigger>
    <IconButton icon={<SettingsIcon />} aria-label="Settings" />
    <Menu portalContainer={player} submenuPresentation="replace" placement="top-end" offset={8}>
      <SubmenuTrigger>
        <MenuItem key="quality" description={qualityLabel}>Quality</MenuItem>
        <Menu selectionMode="single" deselectable={false} afterSelect="back" selectedKeys={[quality]} onSelectionChange={onQuality}>
          <MenuItem key="auto">Auto</MenuItem>
          <MenuItem key="1080">1080p</MenuItem>
          <MenuItem key="720">720p</MenuItem>
        </Menu>
      </SubmenuTrigger>
      <SubmenuTrigger>
        <MenuItem key="speed" description={speedLabel}>Playback speed</MenuItem>
        <Menu selectionMode="single" deselectable={false} afterSelect="back" selectedKeys={[speed]} onSelectionChange={onSpeed}>
          <MenuItem key="0.5">0.5×</MenuItem>
          <MenuItem key="1">Normal</MenuItem>
          <MenuItem key="1.5">1.5×</MenuItem>
        </Menu>
      </SubmenuTrigger>
    </Menu>
  </MenuTrigger>
</div>
```

## Behaviour

### Submenus in place (`submenuPresentation="replace"`)

- **What a submenu page holds:** pressing a submenu item, or Enter, Space or the forward arrow on it, shows its submenu in the same surface. The page has a header (a 48px back button and the item's label) above the submenu's list, and the first page is hidden. Hover never opens a page, since that would change the content under the pointer, so `openDelay` doesn't apply (as in a sheet).
- **Going back:** the back button, Escape or the back arrow returns to the previous page.
- **Closing:** Escape on the first page closes the menu. Tab closes every page and the menu. An action on any page closes the whole menu and returns focus to the trigger.
- **Each page is a menu:** a page is the submenu's own `role="menu"`, with its own items, `onAction`, `disabledKeys`, `selectionMode`, `selectedKeys`, `onSelectionChange` and `deselectable` (React Aria's own submenu state, as beside).
  - In a `single` page, a choice closes the menu and Space keeps it open on that page, unless the page sets `afterSelect="back"` (below).
  - In a `multiple` page, toggles keep it open.
  - A `MenuGroup` with its own `selectionMode` works on any page, the first included: a "Loop" checkbox group beside the Quality and Playback speed rows, for instance.
- **Pages two or more deep** stack in the surface: Settings › Subtitles › Font size. Each Back, Escape or back arrow goes back one level, the height follows every page, and focus returns to the item that opened the page left.
- **Typeahead** works per page: letters move within the visible page's items. The back button isn't an item, so it's never reached.
- **No shape morph:** the corner change while a submenu is open (24px on the menu with focus, 8px on the others) doesn't apply, since only one page shows. The surface keeps the menu's resting corner.
- **Coming back to a long first page:** the item that opened the page takes focus again, which scrolls it back into view inside the list.
- **`instant`:** page changes are instant too (no height motion, no fade or slide), as `instant` turns off the menu's other motion.

### After a choice (`afterSelect`)

- **`close`** (the default): a choice on a single-choice page closes the whole menu, as in any single-select menu.
- **`back`**, for a settings page whose choice is all it's for (Quality, Playback speed):
  - In place, a choice by press or Enter goes back one page. The page it returns to shows the new choice (an item's `description` the app derives from it), and the item that opened the page takes focus.
  - Beside, a choice closes only that submenu (not its parent menus), and its item takes focus.
  - Space chooses and keeps the page open, as it keeps a single-select menu open.
  - What counts is a choice that would close the menu: the page's own `single` items, or a single-choice `MenuGroup` on it. A toggle in a `multiple` page or group never closes it. An action (a plain item, or a `none` group's) still closes the whole menu and returns focus to the trigger.
  - `onSelectionChange` and `onAction` are called as before, then the page goes back.

### With `presentation`

- **`sheet`:** a sheet always shows submenus in place. `submenuPresentation` is ignored there, and the shared changes reach the sheet through the new `classNames` keys, `backIcon`, `submenuTransition` and `afterSelect`. The sheet's height still follows its content at once (`BottomSheet` animates no height).
- **`auto`:** below 600px the menu is a sheet, which replaces. From 600px up it's a popover that follows `submenuPresentation`.
- **`portalContainer` and the sheet:** a sheet ignores `portalContainer` (open question 3). As every overlay does, a sheet still opens inside the element in full screen.

### Opening inside an element (`portalContainer`)

- **Where the popover goes:** it portals into the element, keeping the theme, `ThemeScope` classes and variables, density and text direction of where the `Menu` is declared (`Overlay`). Its submenus beside it, and its pages, go into the root popover as today.
- **Placement:** it's placed against its trigger (or, for a `ContextMenuTrigger`, against the pointer) as today, then kept within the element `containerPadding` from its edges. It flips if the other side has more room, shifts along the cross axis and caps its height, and its list scrolls.
- **Moving with the container:** the popover is `position: absolute` inside the container, so whatever moves the container carries it in the same frame, with no script: a pane that scrolls, a change of layout, a resize. While a modal menu is open, the document itself doesn't scroll (React Aria's scroll lock, as for every menu today).
- **Full screen:**
  - The container is the menu's place before, during and after full screen, so a menu opened before the player goes full screen stays visible. Without a container, it would stay in `body`.
  - In full screen the player is `position: fixed` at the screen's size, so it's still the popover's containing block, and the boundary is the screen.
  - Entering and leaving full screen resizes the viewport, which places the menu again (React Aria). A container that resizes on its own is handled by decision 12.
- **A trigger outside the container works:** the menu is placed against the trigger and kept within the container on the cross axis, with its height capped. It can't move past its trigger along the main axis, so the docs say to keep the trigger inside the container or along its edge.
- **The container:**
  - It must be an element that draws its children. A `<video>`, `<canvas>`, `<img>`, `<iframe>`, a form control or an SVG element warns in development, using the same list `Overlay` uses for full screen.
  - The docs ask for `position: relative` on it (a player usually has it). A static container still works when its offset parent moves with it.

## Keyboard, focus and assistive tech

| Keys | In place |
|---|---|
| Enter, Space, the forward arrow (Right; Left in right-to-left) | On a submenu item: show its page and focus the page's first item |
| Escape, the back arrow (Left; Right in right-to-left) | On a page: go back one page and focus the item that opened it. On the first page, Escape closes the menu |
| Enter on a choice | Chooses it and closes the menu; with `afterSelect="back"`, goes back one page with focus on the item that opened it |
| Space on a choice | Chooses it and keeps the page open |
| Tab, Shift + Tab | Close every page and the menu; focus moves past the trigger, as today |
| Letters | Typeahead within the visible page |

- **Focus on a new page:** a page takes focus however it opened, since the item that opened it is now hidden (`autoFocus` `first`, as in the sheet). Focus goes to the page's first item, or to its selected item in a selectable page, as React Aria opens every selectable menu.
- **Focus on going back:** the item that opened the page takes focus once it shows again. That's the sheet's refocus after commit, shared. After a choice with `afterSelect="back"`, focus goes to that item too, in place and beside.
- **The back row:**
  - The back control is a `button` named by `labels.back` ("Back"). It's outside the page's `menu`, as in the sheet, since a menu holds only its items, and it isn't in the arrow order.
  - Pointer and touch users press it, and screen-reader users reach it with the virtual cursor or by swiping. Keyboard users go back with Escape or the back arrow, so going back works from the keyboard (WCAG 2.1.1), although Tab closes the menu rather than reaching the button (the APG menu button pattern, as today).
  - The title next to it is the item's label, as plain text.
  - Open question 5 asks whether the button should be in the arrow order.
- **The page's name:** each page's `menu` is named by its item (React Aria's `aria-labelledby`) and keeps its item's `aria-haspopup="menu"` and `aria-expanded`.
- **No live announcement:** moving focus into the new `menu` announces its name, its role and the focused item, so a live region would say it twice.
- **Targets:** the back button is 48px at every density. Items keep their 44px (less 4px a step).

## Motion

- **Height:**
  - The surface's `height` follows the visible page, which is measured as each page goes in (built: `usePageHeight`, decision 5). A size change that comes with a new page springs; any other change follows at once (a font arriving, text changing), as `data-resized` does for the toolbar.
  - It grows on the default spatial spring. That's the core's height spring for showing more content (the list's nested rows); M3 asks for no bouncy springs in common transitions, and the fast spring overshoots about 9%.
  - It shrinks over the same duration on the default effects spring's easing.
  - It never animates as the menu opens: the reveal does that. While the size is unmeasured, and on the server, it's `undefined` and the surface takes its natural size.
- **Content (`submenuTransition`):**
  - `fade` (default): the outgoing page goes at once and the incoming page fades in on the fast effects spring (the sheet's `sheetPanel`). There are no overlapping half-faded pages (M3: "Fully fade out content before fading new content in"), and nothing moves sideways while the height moves.
  - `slide`: M3's forward and backward pattern ("a horizontal sliding motion", "Android uses a fade as screens slide"). Going forward the incoming page slides in 30px from the end edge, going back from the start edge (left and right swap in right to left), on the default spatial spring, while it fades in on the fast effects spring. The outgoing page still goes at once, so two pages never overlap. The surface clips the page while it slides.
  - The pages read the direction from the surface (`data-page-direction`, `forward` or `back`), which is set from the first page change on, so the first page never fades or slides in as the menu opens: the reveal does that. Going back to the first page fades it in too (the sheet didn't).
- **Reduced motion:** the spatial durations are 0ms in the reduced-motion token set, so the height changes at once and the slide drops with no code of their own. The page still fades, as the reduced-motion rule keeps fades (§6). `instant` drops the height motion, the fade and the slide.
- **Placement during the change:** React Aria places the popover again on every frame of its size change (its `ResizeObserver`). With the side held (decision 8), the corner nearest the trigger stays where it is.

## Theming, direction, server rendering, layout safety

- **Theming:**
  - No new tokens.
  - The surface is the menu's own surface, with its colour, corners and elevation tokens, and draws a 1px `CanvasText` outline in forced colours.
  - The header's text and icon read the item tokens, and the back button has the state layer and the `outline` focus ring.
  - Each new part has a `classNames` key, and the back icon can be replaced.
  - A theme, `ThemeScope` or token override reaches a menu in a container as it reaches one in `body` (decision 11).
- **Right to left:**
  - The back arrow is Right, and the back icon mirrors.
  - The root menu already gives React Aria a locale with the DOM's direction, so the arrows follow a right-to-left region.
  - `start` and `end` placements are already turned into physical sides from the trigger's direction.
  - The slide follows the reading direction: forward comes from the end edge (the left in right to left).
- **Server rendering:** nothing changes. An open menu draws no portal while hydrating, `portalContainer` is read only in the browser, and the measured height is unset on the server.
- **Layout safety:**
  - `className` and `style` stay on the box React Aria places, and `classNames.panel` reaches the surface.
  - Consumer `w-full`, `static`, `overflow-*` or inset classes on the box can't move or stretch the surface (`menuOwnWidth`, `data-overlay-placement`).
  - The surface sets its own explicit height, never a transform.
  - Inside an app's container that has a transform, filter or `contain`, the `fixed` underlay covers only the container. Presses outside still close the menu, since React Aria listens on the document and the rest of the page is inert.
  - The popover doesn't rely on `fixed` for its own place.

## Shared with the sheet

The sheet's drill-in is the base. What changes:

- **`MenuTreeContext`:** gains `replace` (submenus show in place): always true in a sheet, and in a popover with `submenuPresentation="replace"`. Today's three uses of `tree.sheet` (choosing the page or the beside popover, dropping hover, refocusing the item after the page closes) read `replace` instead. `sheet` stays for what is the sheet's own.
- **`SubmenuSheetPanel` becomes the shared page:** the header, `SheetBackButton` (renamed for the menu), the title and the embedded `MenuList`, portalled with `Overlay` (`disableFocusManagement`) into `tree.container`. In the popover, `tree.container` is the surface inside the reveal, not the placed box.
- **The hiding rules:** the `:has()` rules that hide every page but the last (`sheetContent`) apply to the popover's surface too, so nested pages stack the same way.
- **`menuStyles` slots:** `sheetPanel` (the fade), `sheetHeader`, `sheetBack` and `sheetTitle` keep their names, since the recipe is public. Their TSDoc says they draw a page in a sheet or in place. `embedded` gains the popover form: no surface of its own, keeping the list's 112–280px width. Built: the 112–280px width and the 4px padding sit on the popover's pages container, so `embedded` needed no second form. The in-place classes (the surface, the pages, the page motion and the slide, the row's token colours) are a recipe of their own, `menuPageStyles`, loaded with the in-place code (decision 17), so `menuStyles`' sheet slots stay what they were.
- **New, popover only:** the surface and its measured height, the held side, the container and its boundary, and placing the menu again on a resize.

## Docs site

- **Example `menu/menu-player-settings`:** a neutral player placeholder (16:9, `surface-container-highest`, with a settings icon button in its bottom end corner and a full-screen button), showing both options. Quality and Playback speed are single-choice pages that go back after a choice (`afterSelect="back"`), with a "Loop" checkbox group on the first page, and the pages slide (`submenuTransition="slide"`).
- **Menu page:** a section "Submenus beside or in place" says when to use each. Beside is for app menus, toolbars and context menus with room, as M3 shows. In place is for a menu confined to a small surface: a player, a card, a narrow panel. A section "Opening inside an element" covers `portalContainer`, `position: relative`, full screen and a trigger outside.
- **API table:** generated from the TSDoc.
- **Accessibility tab:** keys for pages (Escape and the back arrow go back one page; Escape on the first page closes the menu). The back button's role, name and place. Focus on a page and back. The height and fade motion, and reduced motion. A note for consumers: name the settings button, and give the container `position: relative`.
- **Spec data:** two extensions ("Submenus in place", "Opening inside an element").
- **Playground:**
  - `submenuPresentation` and `submenuTransition` controls, with the preview's Share item opening a two-item submenu so the controls show something.
  - `portalContainer` and `backIcon` are listed in `notControlled`, with reasons: an element of the page; the example shows it.
- **Changeset:**
  - `Added:` `submenuPresentation`, `portalContainer`, `submenuTransition`, `afterSelect`, the new `classNames` keys and `backIcon`.
  - `Fixed:` `Overlay` in an app's container carries only the theme attributes that differ.
- **Architecture:** §9 Menu and §3 `Overlay` are updated when it's built.

## Checks

- **Unit (Vitest):**
  - **In place:**
    - A page replaces the first page in the same surface, below a back button named by `labels.back` and the item's label.
    - Hover doesn't open a page.
    - Focus goes to the first item, or to the selected one.
    - Escape and the back arrow go back with focus on the item, in left-to-right and right-to-left.
    - Escape on the first page closes the menu.
    - The back button goes back.
    - Tab closes everything.
    - Typeahead stays within the page.
  - **Pages two deep:** back one level at a time.
  - **Selection on a page:** `single` closes, with Space keeping it open; `multiple` stays open; a `MenuGroup` of choices on a page.
  - **`afterSelect="back"`:** a choice goes back in place and the page it returns to shows the new choice, with focus on the item; beside, only the submenu closes and its item takes focus; Space keeps the page open; a toggle in a `multiple` page stays; an action still closes the whole menu.
  - **`submenuTransition`:** the surface carries the direction (`forward`, then `back`) from the first page change only, and `slide` marks it for the slide, in the popover and the sheet.
  - **`onAction` from a page** closes the menu and returns focus to the trigger.
  - **`instant`.**
  - **The defaults are unchanged:** the existing beside and sheet tests pass untouched. `presentation="sheet"` ignores `submenuPresentation`, and `auto` follows it from 600px up.
  - **`portalContainer`:**
    - The popover renders inside the element.
    - Its wrapper carries only the theme attributes that differ, and keeps the direction where it's declared.
    - The boundary reaches React Aria.
    - A `<video>` warns.
    - A `PortalProvider` container is not a boundary.
  - **`classNames.header`, `back` and `title`**, and `backIcon`.
  - **axe** on each page.
- **Browser (Playwright, `e2e/menu.spec.ts`):**
  - **The height**, recorded on every painted frame (`e2e/painted-frames.ts`):
    - It grows to the new page and shrinks to it without going below it.
    - The anchored corner keeps its place on every frame, above and below the trigger, in left-to-right and right-to-left.
    - It never flips mid-change.
  - **Reduced motion** (`e2e/reduced-motion.ts`): the height jumps and the page only fades, with `slide` too.
  - **`slide`:** the incoming page's offset on every painted frame, from 30px at the end edge going forward and from the start edge going back, in left-to-right and right-to-left, while the outgoing page is gone from the first frame.
  - **The container:**
    - The menu stays inside the element, `containerPadding` from its edges, and flips within it.
    - When a pane scrolls the container, the menu keeps its offset from the container on every frame.
    - A container resized without the window places the menu back on its trigger.
    - Full screen with `requestFullscreen`, if headless Chromium grants it (verified 2026-11-18: it does, from the test's `evaluate`). Otherwise, the unit tests fake `document.fullscreenElement` as `Overlay.test.tsx` does.
    - A trigger outside the container.
  - **The override matrix for the container:** `static`, `overflow-hidden`, a `transform`, the `translate` property and `contain: paint`.
- **Stories and screenshots:**
  - A `PlayerSettings` story in `Menu.stories.tsx`: the first page and a page, in every theme, light and dark, vibrant, right-to-left and forced colours.
  - The story guards: scroll, focus ring, forced colours, catalog coverage.
- **Bundle size:** raise `components/menu/Menu` in `bundle-size.json`, and the budgets that include it (`SplitButton`, `FabMenu`, `ButtonGroup`), by what the build measures. The guess was under 1.5 kB gzipped; measured, it was 4.5 kB in the size measure, 2.9 kB of it code (see "Risks"). The sheet stays lazily loaded.
- **Docs tests:** props docs (TSDoc on every new prop and key), playground coverage and snippets, `old-api-names`.

## Risks

- **Container resize:** React Aria places the popover again on a window resize and on its own or its trigger's resize, not on a container resize that moves the trigger without resizing it, and `usePopover` doesn't return `updatePosition`. The plan is to change a dependency of React Aria's position effect for one render as the container resizes (`shouldUpdatePosition` off, then on, inside one layout pass), checked by the browser test. If that proves unreliable, the menu closes on such a resize instead, and React Aria gets an issue asking for `updatePosition` from `usePopover`. **Verified 2026-11-18:** it works with each of the two renders committed at once (`flushSync` in the `ResizeObserver` callback, before the paint; turning it back on in a layout effect is the `set-state-in-effect` pattern the lint rule forbids). A player shrunk from 640 to 480px puts the menu back on its moved trigger.
- **Placing on every frame of a height change:** React Aria measures and writes the box's styles in each `ResizeObserver` callback, for about a spring's duration. It's measured in the browser test. Holding the side (decision 8) keeps it from flipping mid-change. **Verified 2026-11-18:** on every painted frame the anchored edge stays within 0.5px and the end edge within 1px (the width changes at once), above and below the trigger, in both directions, and the height grows and shrinks monotonically to the page, never below it.
- **Missed containing blocks:** React Aria finds the containing block from `offsetParent`, plus `transform`, `filter`, `contain: paint`, `will-change` and `backdrop-filter`. A static container made a containing block only by the `translate`, `rotate` or `scale` properties (Tailwind's `translate-*`) or by `contain: layout` may be missed, which would misplace the menu. The docs ask for `position: relative`, and the override matrix covers these cases. **Verified 2026-11-18:** with `position: relative`, a `transform`, the `translate` property and `contain: paint` place the menu on its trigger inside the player; a `static` player places it in the page's coordinates, also on its trigger (the container then doesn't carry it when a pane scrolls).
- **React Aria's boundary in a positioned container (found while building, 2026-11-18):** React Aria 3.53 measures a custom boundary in the page's coordinates (`getOffset`) but the popover in its containing block's, and when the boundary holds that block (the `portalContainer` itself) adds the boundary's offset from the block on top, so every limit was off by the container's place in the page: in a player 48px from the page's corner, a menu above its trigger was capped 48px short, and in right to left one was placed 552px off its trigger, past the player's edge. The body boundary and the element in full screen (at the page's corner) are unaffected. React Aria gets a stand-in instead (`useBoundaryInContainer`): a hidden, `aria-hidden` box in `<html>` placed where the boundary's padding box sits in the popover's containing block, with that box's size, which its sums read as the boundary; and the popover is `position: absolute` from its first placement, since React Aria starts it `fixed`, whose containing block is the page's, so its first and later placements count from the same block. The browser tests would catch a React Aria release that changes the arithmetic; an issue upstream should follow.
- **Focus keys scrolled a pane (found while building):** React Aria moves focus on Home, End, Page Up and Page Down but leaves their default, which scrolled a pane around the `portalContainer` to its end and carried the open menu away (in `body` the scroll lock had hidden it). The menu prevents their default.
- **Wheel and swipe outside the menu:** whether one scrolls a pane around the container while a modal menu is open depends on the browser's scroll chaining from the `fixed` underlay. Unverified; the browser test records it, and either way the menu stays with the container. **Verified 2026-11-18 (Chromium):** the underlay is inside the container, so a wheel over it scrolls a pane around the container; the menu stays where it is in the container, which carries it.
- **Full screen in headless Chromium:** **verified 2026-11-18:** it grants `requestFullscreen` from the test's `evaluate` (a user gesture), so the browser test opens the menu, enters full screen and checks the menu is drawn on its trigger, and again after leaving.
- **A pointer choice that goes back (`afterSelect="back"`):** the page shown again puts its items under a still pointer, and React Aria focuses an item on hover, as it does in any menu, so after a press focus may be on the item under the pointer rather than the one that opened the page. From the keyboard, focus returns to that item.
- **The audit of 2026-11-19 (fixed):**
  - Closing the whole menu from a page (a choice with `afterSelect="close"`, an action, a press outside) cleared the open submenus at once while the menu played its exit: focus fell to `<body>` for about 200ms (400ms in a sheet, where it happened before this plan too) and the first page showed again at its own height as the menu faded. The open page and the surface's level are now held while the menu leaves; browser tests read focus on every painted frame.
  - A menu closed while its code loaded opened out of sight when the code came, took focus and ran keys; a failed load left its trigger open over nothing. Both fixed (decision 17).
  - In a container partly above the window or in a clipping pane, the menu was placed off screen: React Aria keeps a menu in the window only in the window's coordinates, which the stand-in doesn't share. The stand-in is now only what shows of the container: cut by its clipping ancestors (up to the first `fixed` one, so the element in full screen isn't cut by the page around it) and by the visual viewport. React Aria's own visual-viewport cap still mixes coordinates when the container's top is above the window; it can only make the menu shorter than the room, never place it off screen.
  - Escape on the back button closed the whole menu; it goes back one page, as the back arrow on it does. A sheet opened again kept the last page direction. A submenu's own `className` and `style` were dropped in place, and its own `variant` gave its page other colours than the page that opened it: the page takes them, and the root's variant, in a sheet too (decision 4). The container warning came on every open: once per container now. The module loaded on demand has a size budget.
- **The audit of 2026-11-19, round 6 (fixed):**
  - The stand-in boundary was placed again only when the container resized, but React Aria places the menu again on a window or visual-viewport resize and on its own resize (every page change), reading the old box: a window getting shorter (800 to 300px) left the menu 232px tall, 36px of it past the window's edge with the page's scroll locked, and a page opened after the pane scrolled 150px went 79px above the pane's visible top. The stand-in is placed again first on a window or visual-viewport resize (listeners registered before React Aria's), with the menu placed again; on a scroll around it only the stand-in moves, for React Aria's next placement.
  - A sheet's menu had no locale with the DOM's direction, unlike the popover's, so in a right-to-left region of a left-to-right app → opened a page and ← did nothing (on main too). `useMenuLocale`, split out of `useMenuPopover`, gives the sheet the same locale.
  - A sheet `Select` stayed open over nothing when its sheet failed to load; it closes, as a menu does (`closeOnLoadError`, shared). A sheet menu with pages in place or a container ran both loaders (for the one module) and reported a failure twice; a menu held open by its app never tried again; a sheet's first open loaded the bottom sheet only after the menu's module (decision 17).
  - Docs and samples: the variant's reason (decision 4), `submenuTransition`'s `instant` (a popover only), the sizes below, and the player samples' full-screen button (named by its state, a refused request handled).
- **Bundle size (measured 2026-11-18, again 2026-11-19):** built eagerly, `components/menu/Menu` grew from 34,110 to 38,570 bytes gzipped in the repository's measure, which keeps TSDoc comments (2,940 bytes of it code), more than twice the plan's guess, and `FabMenu`, `menuStyles`' and `Overlay`'s users grew with it. So the in-place and container code loads on demand (decision 17). Over main (whose budgets are `Menu` 32,700, `FabMenu` 42,400, `Select` 35,250; 34,110 was `Menu` after this branch's group-selection fixes, about 1.4 kB of the growth), `Menu` is 35,848 bytes after both audit rounds, about 3.2 kB more, `FabMenu` 45,855 (about 3.5 kB) and `Select` 36,052 (about 0.8 kB: the loader and the close on a failed load); `SplitButton` and `ButtonGroup` grow only with the loader. Every component that imports the loader (`onDemand`: buttons, fields, sheets, dialogs, pickers) is about 300 B bigger in the measure: about 150 B with its `useLoaded`, which re-renders the caller when the part arrives and reports a failed load, and about 185 B with the retries after one. The loaded module, `menu-in-place`, is 8,532 bytes, with a budget.
- **A container smaller than the menu:** the list scrolls within the capped height, but the width can't go below 112px. A container narrower than that plus twice `containerPadding` cuts the menu off.
- **`:has()`:** the hiding rules need `:has()` (Chrome 105, Safari 15.4, Firefox 121), which the sheet already relies on.

## Open questions

Answered on 2026-11-18: every recommendation, with 1 and 2 as props.

1. **Page motion:** should pages only fade in, with the height springing (one axis, the sheet's motion), or should they also slide like M3's forward and backward pattern, 30px from the end edge forward and the start edge back? **Recommended: fade only.** A slide adds a second axis while the height moves, and M3 asks for one ("a unified direction of movement"). **Decided:** fade by default, and `submenuTransition="slide"` for the slide (decision 7).
2. **A choice on a single-choice page:** close the menu, as every single-select menu does (Space keeps it open), or return to the first page? **Recommended: close.** That's what a `menuitemradio` choice does everywhere in the library, and returning could come later as a prop. **Decided:** close by default, and `afterSelect="back"` on a submenu to go back one page (decision 16).
3. **`portalContainer` for the sheet:** popover only, or the sheet too? **Recommended: popover only.** A sheet is a window-level modal with a scrim over the page, and inside a clipped player it would be cut off. It already opens inside the element in full screen.
4. **Width:** follow each page at once, or spring with the height? **Recommended: at once.** Only the height was asked for, and a width spring moves the free edge sideways on every page change.
5. **The back control:** a `button` outside the page's `menu`, as in the sheet, or a menu item at the top of each page in the arrow order (as Spectrum Web Components does)? **Recommended: a button.** A menu holds its items, typeahead would land on "Back", Escape and the back arrow already go back from the keyboard, and the sheet is built that way.
6. **Names:** `submenuPresentation` with `beside` and `replace`, and `portalContainer` taking an `Element`? **Recommended: yes**, for the reasons in "API".

## Not in this plan

- A trailing value slot on items. "Quality · 1080p" goes in `description`, and `shortcut` is a `<kbd>`.
- A height spring for the sheet.
- An `auto` submenu presentation.
- A separate boundary prop.
- Menus that don't lock the page's scroll.
