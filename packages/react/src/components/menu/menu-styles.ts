import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3's Expressive menu (Menu.kt, MenuDefaults.kt and the
 * Menu / StandardMenu / VibrantMenu / SegmentedMenu token files):
 * - groups are separate surfaces 2px apart at elevation 2, with 4px padding (the
 *   SegmentedMenu `GroupPadding` token; Compose's code insets items 2px vertically);
 *   corners: only 16px; first 16px top / 8px bottom; middle 8px; last 8px top / 16px bottom;
 * - items are 44px minimum, 112–280px wide, 12px horizontal padding, label-large, 20px
 *   icons with an 8px gap; 12px when selected (morph on the fast spatial spring);
 * - item corners nest inside their group's: an edge item takes the group's corner minus
 *   the 4px padding (16px → 12px, 8px → 4px), other corners are 4px. Compose picks item
 *   shapes per group alone, so a last item could be rounder than its group's 8px corner;
 * - group labels start 12px from the group's edge and end 4px from it (Compose);
 * - standard: surface-container-low, on-surface text, on-surface-variant icons, selected
 *   tertiary-container; vibrant: tertiary-container, on-tertiary-container content
 *   (icons turn tertiary on hover, focus and press), selected tertiary;
 * - the menu scales from 80% and fades in from its anchor side on the fast springs;
 * - the scrolling list keeps 8px of room around the groups so their shadows aren't clipped.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Menu} and its parts. */
export const menuStyles = tv({
  slots: {
    popover: 'z-(--md-sys-z-menu)',
    motion: [
      'scale-none opacity-100',
      '[transition-property:opacity,scale]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      'starting:scale-80 starting:opacity-0',
      'data-exiting:scale-80 data-exiting:opacity-0',
      'origin-top-left rtl:origin-top-right',
      'data-[placement=top]:origin-bottom-left rtl:data-[placement=top]:origin-bottom-right',
    ],
    // The list scrolls when tall, and a scroll container clips its children's shadows to
    // its box. 8px of padding (cancelled by a negative margin, so nothing moves) leaves room
    // for the groups' elevation-2 shadows; that ring lets clicks through, so a press just
    // outside the menu still dismisses it. Widths include the padding: 112–280px groups.
    menu: [
      '-m-[8px] p-[8px] pointer-events-none',
      'flex max-h-[inherit] min-w-[128px] max-w-[296px] flex-col gap-[2px] overflow-y-auto outline-none',
    ],
    group: 'pointer-events-auto flex flex-col p-[4px] shadow-elevation-2',
    heading: 'flex min-h-[32px] items-center ps-[8px] text-label-large',
    item: [
      'group/item flex min-h-[44px] w-full cursor-pointer items-center px-[12px] text-start',
      'text-label-large outline-none select-none',
      'state-layer focus-ring-inset container-motion container-motion-spatial',
      'data-selected:rounded-corner-medium',
      'data-disabled:cursor-default',
    ],
    selectedIcon: [
      'grid grid-cols-[0fr] opacity-0',
      '[transition-property:grid-template-columns,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      'group-data-selected/item:grid-cols-[1fr] group-data-selected/item:opacity-100',
    ],
    selectedIconInner: 'overflow-hidden',
    icon: 'me-[8px] inline-flex size-[20px] shrink-0 items-center justify-center [&>svg]:size-full',
    text: 'flex min-w-0 flex-1 flex-col',
    description: 'text-body-medium',
    trailing:
      'ms-auto inline-flex shrink-0 items-center ps-[12px] text-label-large [&>svg]:size-[20px]',
  },
  variants: {
    variant: {
      standard: {
        group: 'bg-surface-container-low',
        heading: 'text-on-surface-variant',
        item: [
          'text-on-surface',
          'data-selected:bg-tertiary-container data-selected:text-on-tertiary-container',
          'data-disabled:text-on-surface/38',
          'data-disabled:data-selected:bg-tertiary-container/38 data-disabled:data-selected:text-on-tertiary-container/38',
        ],
        icon: 'text-on-surface-variant group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
        description:
          'text-on-surface-variant group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
        trailing:
          'text-on-surface-variant group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
      },
      vibrant: {
        group: 'bg-tertiary-container',
        heading: 'text-on-tertiary-container',
        item: [
          'text-on-tertiary-container',
          'data-selected:bg-tertiary data-selected:text-on-tertiary',
          'data-disabled:text-on-tertiary-container/38',
          'data-disabled:data-selected:bg-tertiary/38 data-disabled:data-selected:text-on-tertiary/38',
        ],
        icon: [
          'text-on-tertiary-container',
          'group-data-hovered/item:text-tertiary group-data-focus-visible/item:text-tertiary group-data-pressed/item:text-tertiary',
          'group-data-selected/item:text-on-tertiary',
          'group-data-selected/item:group-data-hovered/item:text-on-tertiary',
          'group-data-selected/item:group-data-focus-visible/item:text-on-tertiary',
          'group-data-selected/item:group-data-pressed/item:text-on-tertiary',
          'group-data-disabled/item:text-on-tertiary-container/38',
        ],
        description:
          'text-on-tertiary-container group-data-selected/item:text-on-tertiary group-data-disabled/item:text-on-tertiary-container/38',
        trailing: [
          'text-on-tertiary-container',
          'group-data-hovered/item:text-tertiary group-data-focus-visible/item:text-tertiary group-data-pressed/item:text-tertiary',
          'group-data-selected/item:text-on-tertiary',
          'group-data-selected/item:group-data-hovered/item:text-on-tertiary',
          'group-data-selected/item:group-data-focus-visible/item:text-on-tertiary',
          'group-data-selected/item:group-data-pressed/item:text-on-tertiary',
          'group-data-disabled/item:text-on-tertiary-container/38',
        ],
      },
    },
    groupPosition: {
      only: { group: 'rounded-corner-large' },
      first: { group: 'rounded-t-corner-large rounded-b-corner-small' },
      middle: { group: 'rounded-corner-small' },
      last: { group: 'rounded-t-corner-small rounded-b-corner-large' },
    },
    /** The item's top corners: `nested` inside a 16px group corner, else 4px. */
    itemTop: {
      nested: { item: 'rounded-t-corner-medium' },
      plain: { item: 'rounded-t-corner-extra-small' },
    },
    /** The item's bottom corners: `nested` inside a 16px group corner, else 4px. */
    itemBottom: {
      nested: { item: 'rounded-b-corner-medium' },
      plain: { item: 'rounded-b-corner-extra-small' },
    },
    hasDescription: {
      true: { item: 'py-[8px]' },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'standard',
    groupPosition: 'only',
    itemTop: 'plain',
    itemBottom: 'plain',
    hasDescription: false,
  },
});

export type MenuStyleProps = VariantProps<typeof menuStyles>;
export type MenuVariant = NonNullable<MenuStyleProps['variant']>;
