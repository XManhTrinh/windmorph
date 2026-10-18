# Plan: List items that are real links (`@windmorph/react`, M3)

Status: approved (2026-10-10).

## Problem

A `List` with `href` items becomes a React Aria grid list, whose rows are `div`s that navigate when pressed. They aren't `<a>` elements, so the browser treats them as something other than links:

- right-click has no "Copy link address" or "Open in new tab";
- hovering shows no URL in the status bar;
- the links don't show up in the browser's or a screen reader's list of links;
- the whole list is one Tab stop, with ↑ / ↓ inside it, unlike every other set of links on the page.

## Decisions

1. **A list whose items are links (and static, switch or checkbox items) is a plain `ul`.** Each link item is an `<li>` styled as the list item, with a real `<a href>` on its headline whose overlay (`::after`, inset 0) covers the whole item, so the whole item is the link: the same state layer, shape morphs, segmented corners and heights. Buttons in its leading or trailing content (a request's Confirm and Delete) sit above the overlay and stay separate controls, never nested inside the link (HTML forbids that, and a press on them would follow the link). The link is named by the headline and described by the overline and supporting text. Each link is its own Tab stop and Enter follows it, as links do everywhere. This is the web standard for a group of links, and the usual pattern for a card or row that links somewhere and also has its own buttons.
2. **Client-side navigation keeps working.** The anchor uses React Aria's `useLink`, so `NextRouterProvider` (or any `RouterProvider`) routes a plain click through the app router, `useNavigationGuard` included. Ctrl / ⌘ / middle click and the context menu stay the browser's own.
3. **`current` marks the page you're on:** `aria-current="page"` and the selected colours (`secondary-container`, the selected shape). This is what list-detail layouts and settings menus need, and it replaces hand-written selected classes.
4. **`target`, `rel` and `download`** pass through to the anchor. With `target="_blank"` and no `rel`, Windmorph adds `rel="noopener noreferrer"`.
5. **Disabled link items** render no `href` and `aria-disabled="true"`, the same as `Link` and `Button`. They take `disabled` or the list's `disabledKeys` / `disabled`.
6. **Lists with `onAction` or `selectionMode` stay grid lists.** Their link items keep React Aria's grid behaviour. A row that is both a grid row and a link can't be an `<a>` without nesting two controls, so the docs recommend a plain list when the items only go somewhere.
7. **Nothing else changes.** Static, action, selection, switch, checkbox and radio lists behave exactly as before.

## API

```tsx
<List variant="segmented" aria-label="Settings">
  <ListItem key="profile" href="/settings" current leading={<PersonIcon />}>
    Profile
  </ListItem>
  <ListItem key="terms" href="/legal/terms">Terms of service</ListItem>
</List>
```

New `ListItem` props: `current`, `target`, `rel` and `download` (link items).

## Tests and checks

- The item is an `<a>` with its `href`, in a `listitem`, named by its content; Tab reaches each one and Enter follows it through the `RouterProvider`; a modified click is left to the browser.
- `current` sets `aria-current="page"` and the selected colours; a disabled item has no `href` and has `aria-disabled`.
- `target="_blank"` adds `rel="noopener noreferrer"`.
- axe; hover, focus and press morph the corners (browser test); light, dark and RTL screenshots.
- The docs: the "Which list" guide, keyboard notes and an example of a settings menu.

## In apps, once it's built

A settings menu sets `current` on the open section instead of hand-written selected classes, and its section and legal lists become real links.
