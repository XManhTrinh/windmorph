# Plan: `ListItem`'s full M3 API: images, video thumbnails, line limits and dividers

Status: approved (2026-10-12), asked for the same day: the full API of `ListItem`, image support included.

## Problem

`List` and `ListItem` cover M3's text, icons, avatars, links, selection and the switch, checkbox and radio items. Three parts of M3's list are missing, so apps build them by hand:

- **Leading images and video thumbnails.** An app's "Recently deleted" list puts its own 56dp `<img>` in `leading`, with a tonal square and an icon when a post has no photo. Listings, orders, bookings and saved items will each need the same. The item doesn't know it holds an image, so its heights and alignment aren't M3's.
- **Line limits.** M3's two-line item has one line of supporting text, and the three-line item two. Ours grows with its text, so apps clamp the headline with `classNames`.
- **Dividers.** M3 lists can separate items with full-width or inset dividers. Ours can't.

## What M3 says

From M3's list tokens (`md.comp.list`):

| Part | Size | Shape |
| --- | --- | --- |
| Leading icon | 24dp | |
| Leading avatar | 40dp | full |
| Leading image | 56 × 56dp | none (square) |
| Leading video | 100dp wide; 56dp tall (small) or 69dp (large) | none (square) |

Items are at least 56, 72 and 88dp tall for one, two and three lines (as today), 16dp in from each side, and dividers sit 16dp in from each side when inset.

## API

### `ListItemImage` and `ListItemVideo`

Go in `leading`. The list sees them and lays the item out for them.

```tsx
<ListItem
  key="post-1"
  leading={<ListItemImage src={photo.url} alt="" fallback={<ArticleIcon />} />}
  supportingText="Deleted 3 days ago · 27 days left"
>
  Dinner at our place
</ListItem>

<ListItem key="video-1" leading={<ListItemVideo src={thumb} alt="" duration="2:41" />}>
  How to make pancakes
</ListItem>
```

- **`ListItemImage`:** a 56dp frame with `src`, `alt`, `srcSet` and `sizes`, lazy loading and async decoding. `children` replaces the `<img>` (a framework image such as `next/image`) and the frame still sizes it. `fallback` shows instead when there's no `src` or the image fails to load: an icon on `secondary-container`, as M3 shows a missing image.
- **`ListItemVideo`:** a video's thumbnail, not a player. A 100 × 56dp frame (`size="large"`: 100 × 69dp), with a play badge and an optional `duration` in the corner. Pressing it is pressing the item.
- **Layout:** an item with one aligns its content to the top when it has three lines, as M3 does, and grows to fit the media's height plus its padding.
- **Shape:** square by default, as M3 specifies. `classNames.media` rounds it (for example, to 12dp corners).
- **Selected and disabled:** the image fades to 38% when disabled, as other leading content does.

### Line limits

- **`headlineLines`** and **`supportingTextLines`** on `ListItem` and as list-wide defaults on `List`. Text past the limit ends with "…", and the full text stays in the item's accessible name.
- **Defaults:** no limit, so existing lists don't change. The docs recommend M3's limits (one line of supporting text in a two-line item, two in a three-line one).

### Dividers

- **`dividers="full" | "inset"`** on `List`, for `variant="standard"` only (segmented items are already apart). `inset` starts the divider where the text starts, as M3 does under an icon or avatar.
- **Drawing:** the dividers are drawn in CSS, with `outline-variant`, so they add nothing to the list's semantics.

## Accessibility

- An image with `alt=""` is decorative, which is right when the headline says what it is. A meaningful image takes an `alt`.
- The video's play badge and duration are hidden from assistive tech, with the duration added to the item's description, so it's heard once.
- A fallback icon is decorative.
- The 48dp touch targets, the focus ring, forced colours and right-to-left work as for every item.

## Tests and checks

- **Unit tests:**
  - `ListItemImage`'s sizes, `srcSet`, lazy loading, custom children, and its fallback with no `src` and after an error;
  - `ListItemVideo`'s sizes and duration;
  - the item's alignment with media;
  - both line limits, and the full text in the accessible name;
  - both kinds of divider, and none in segmented lists;
  - axe on every case.
- **Stories and screenshots:** media lists (image, fallback, video, three-line), line limits and dividers, across themes, modes, contrast, right-to-left and forced colours, with neutral English samples.
- **Docs:** Images and video, Line limits and Dividers sections on the List page, with examples, search keywords and the component count. A minor changeset.

## Not in this plan

- **Tokens for `List`:** Windmorph's M3 components read the system tokens directly. Adding `--md-comp-list-*` tokens to `List` alone would make it the odd one out, so that's for a plan that covers all of them.
- **Section headers:** M3 Expressive's lists have none. Group lists with a heading above each, as a settings page does.

## In apps

A hand-built image list moves to `ListItemImage` with its icon as the `fallback`, `classNames.media` for any rounded corners, and `headlineLines={2}` in place of a `line-clamp-2` class.

## As built (2026-10-12)

- **No special layout for media:** the item already grows to fit them and aligns three-line items to the top, so the list doesn't need to detect them. Media take the list's `classNames.media` through context.
- **The video's length is read as text**, after the thumbnail and before the headline; only the play badge is hidden from assistive tech.
- **Broken images on the server:** an image that failed before hydration never fires `onError`, so on mount a complete image with no natural width is checked with `decode()` (an SVG with no size has no natural width, yet decodes).
- **Dividers** are the item's `::after`, because the state layer already uses its background. In forced colours they're `GrayText`.
- **Segmented lists refuse `dividers`** with an error, as other invalid combinations do.
- **Styles** are a second recipe, `listMediaStyles`, so the class tests cover them.
- **Found by the new examples:** `List` dropped items that a server component's payload hands over as lazy elements (Next's dev server does for some), so the server rendered an empty list and hydration failed. It now collects its items with `Children.forEach`, which unwraps them.
