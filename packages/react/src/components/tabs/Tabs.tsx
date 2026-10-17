'use client';

import { animate, useReducedMotion } from 'motion/react';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  I18nProvider,
  mergeProps,
  useLocale,
  useObjectRef,
  useTab,
  useTabList,
  useTabPanel,
  type AriaTabListProps,
} from 'react-aria';
import { Item, useTabListState, type Key, type Node, type TabListState } from 'react-stately';
import { useM3Spring } from '../../motion/use-m3-spring';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { localeWithDirection } from '../../primitives/locale-with-direction';
import { densityAttribute, type Density } from '../../tokens/density';
import { FOCUSABLE_DISABLED_OPTIONS } from '../../utils/focusable-disabled';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { useNearestReveal } from '../../utils/nearest-reveal';
import { cn } from '../../utils/cn';
import { useWarnOnce } from '../../utils/warn-once';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { BadgedBox, type BadgeProps } from '../badge/Badge';
import { tabsStyles, type TabsVariant } from './tabs-styles';

/** How far (px) a horizontal swipe on a swipeable panel travels before it changes tab. */
export const TAB_SWIPE_THRESHOLD = 56;

/** Props of a {@link Tab}; the React `key` identifies it for selection. */
export interface TabProps {
  /** The tab's label. Optional for icon-only tabs, which then need `aria-label`. */
  title?: ReactNode;
  /** Icon above (or before) the label. Hidden from assistive tech. */
  icon?: ReactNode;
  /** The panel shown while this tab is selected. Leave it out for tabs that only navigate. */
  children?: ReactNode;
  /** Plain-text label when `title` is not a string. */
  textValue?: string;
  /**
   * A {@link Badge} for news in this tab (at most four characters, "+" included). It sits on
   * a stacked icon, otherwise 4px after the label, and describes the tab to assistive tech.
   */
  badge?: ReactElement<BadgeProps>;
  /** Accessible name for the tab. Required for icon-only tabs, which have no `title`. */
  'aria-label'?: string;
}

/** A tab in {@link Tabs} (a React Stately collection item: identify it with `key`). */
export const Tab = Item as unknown as (props: TabProps) => JSX.Element;

export interface TabsClassNames {
  /** The outer container, merged with `className`. */
  root?: string;
  /** The row's scrolling box around `list` (it carries the row's surface when aligned). */
  scroller?: string;
  /** The row of tabs (`role="tablist"`). */
  list?: string;
  /** Every tab. */
  tab?: string;
  /** Each tab's icon. */
  icon?: string;
  /** Each tab's label. */
  label?: string;
  /** The active indicator under the selected tab. */
  indicator?: string;
  /** The selected tab's panel. */
  panel?: string;
}

export interface TabsProps extends Omit<
  AriaTabListProps<object>,
  | 'children'
  | 'orientation'
  | 'items'
  | 'isDisabled'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
> {
  /** `Tab` elements. */
  children: ReactNode;
  /** The selected tab's `key` (controlled). */
  value?: Key | null;
  /** The tab selected at first, when uncontrolled. @default the first enabled tab */
  defaultValue?: Key;
  /** Called with the newly selected tab's `key`. */
  onChange?: (key: Key) => void;
  /** Disables every tab (`disabledKeys` disables some). @default false */
  disabled?: boolean;
  /**
   * `primary` tabs sit below the top app bar and switch the page's main content;
   * `secondary` tabs switch content within one section. @default "primary"
   */
  variant?: TabsVariant;
  /** Tabs keep their natural width (at least 90px) and the row scrolls. @default false */
  scrollable?: boolean;
  /** Icons above the label (64px tabs) or before it (48px). @default "top" */
  iconPlacement?: 'top' | 'start';
  /**
   * Web density, `0` to `-3`, for the tab row (not the panels): each step takes 4px off the
   * tabs (48px at 0, 36px at -3; 64px to 52px with icons above). Left out, the tabs take the
   * density of the nearest `ThemeProvider` or `ThemeScope`. M3 asks for density to be the
   * reader's choice rather than a default, so prefer setting it there, from a setting.
   * @default 0
   */
  density?: Density;
  /**
   * Fixed tabs: `stretch` fills the row; `start` and `center` make every tab as wide as
   * the widest and place the group at the leading edge or the centre (M3's layout for wide
   * windows). Ignored when `scrollable`. @default "stretch"
   */
  align?: 'stretch' | 'start' | 'center';
  /**
   * A horizontal swipe on the panel selects the next or previous tab (mirrored in RTL), as
   * M3 tabs do. Vertical gestures still scroll. Avoid it when the panel holds swipeable
   * content such as a map or a carousel. @default false
   */
  swipeable?: boolean;
  /**
   * `manual`: the arrow keys move focus and Space / Enter selects the focused tab, the M3
   * keyboard pattern. `automatic` selects on focus. @default "manual"
   */
  keyboardActivation?: 'manual' | 'automatic';
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: TabsClassNames;
  /** Ref to the root `<div>` element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * M3 tabs: a row of tabs with an indicator that slides to the selection, and the selected
 * tab's panel. Primary tabs mark the selection with a content-width indicator and
 * `primary` label; secondary tabs with a full-width indicator. Arrow keys move focus
 * between tabs (mirrored in RTL), Home / End jump to the ends, and Space / Enter selects.
 *
 * @example
 * <Tabs aria-label="Trip">
 *   <Tab key="flights" title="Flights" icon={<FlightIcon />}>Flight details…</Tab>
 *   <Tab key="hotels" title="Hotels" icon={<HotelIcon />}>Hotel details…</Tab>
 * </Tabs>
 */
export function Tabs(props: TabsProps) {
  const { className, style, classNames, ref, ...rest } = props;
  const { data, rest: ariaProps } = splitDataAttributes(rest);
  const rootRef = useObjectRef(ref);
  // React Aria takes arrow-key direction from its locale, not the DOM `dir`; follow the
  // direction the tabs are actually laid out in.
  const { locale, direction: localeDirection } = useLocale();
  const [direction, setDirection] = useState(localeDirection);
  useLayoutEffect(() => {
    if (rootRef.current) setDirection(getComputedStyle(rootRef.current).direction as 'ltr' | 'rtl');
  }, [rootRef]);
  const effectiveLocale =
    direction === localeDirection ? locale : localeWithDirection(locale, direction);

  return (
    <div
      {...data}
      ref={rootRef}
      style={style}
      data-tokens={mergeDataTokens('md-comp-tabs', data)}
      data-variant={props.variant ?? 'primary'}
      className={tabsStyles().root({ class: cn(classNames?.root, className) })}
    >
      <I18nProvider locale={effectiveLocale}>
        <TabsInner
          {...(ariaProps as Omit<TabsProps, 'className' | 'style' | 'ref'>)}
          classNames={classNames}
          rtl={direction === 'rtl'}
        />
      </I18nProvider>
    </div>
  );
}

/** No disabled keys, for the tab list's arrow keys (disabled tabs stay focusable). */
const NO_KEYS: Set<Key> = new Set();

function TabsInner({
  rtl,
  ...props
}: Omit<TabsProps, 'className' | 'style' | 'ref'> & { rtl: boolean }) {
  const {
    variant,
    scrollable = false,
    iconPlacement = 'top',
    align = 'stretch',
    swipeable = false,
    density,
    classNames,
  } = props;
  // A Tab's children are its panel content, which can be server-rendered: check only the Tabs.
  assertCollectionChildren(props.children, 'Tabs', 'Tab elements', { nested: false });
  const { disabled, value, defaultValue, onChange, ...rest } = props;
  const ariaProps = {
    ...rest,
    ...(value !== undefined && { selectedKey: value }),
    ...(defaultValue !== undefined && { defaultSelectedKey: defaultValue }),
    ...(onChange && { onSelectionChange: onChange }),
    isDisabled: disabled,
    keyboardActivation: props.keyboardActivation ?? 'manual',
  } as AriaTabListProps<object>;
  // Disabled tabs stay focusable but can't be selected (WAI-ARIA APG, "Focusability of disabled
  // controls"), so screen reader users find them: React Stately's `selection` behaviour, and
  // arrow keys that don't skip them (the tab list's keyboard sees no disabled keys).
  const state = useTabListState({ ...ariaProps, ...FOCUSABLE_DISABLED_OPTIONS });
  const listRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { tabListProps } = useTabList(ariaProps, { ...state, disabledKeys: NO_KEYS }, listRef);
  const items = [...state.collection];
  const hasIcon = items.some((item) => (item.props as TabProps).icon != null);
  const hasText = items.some((item) => (item.props as TabProps).title != null);
  const hasPanels = items.some((item) => (item.props as TabProps).children != null);
  // M3: every tab in a row has an icon, or none does; an icon-only tab needs a name.
  useWarnOnce(
    hasIcon && items.some((item) => (item.props as TabProps).icon == null),
    '[@windmorph/react] Give every Tab an icon, or none (M3: tabs in a row are consistent).',
  );
  const unnamed = items.find(
    (item) => (item.props as TabProps).title == null && !(item.props as TabProps)['aria-label'],
  );
  useWarnOnce(
    unnamed !== undefined,
    '[@windmorph/react] An icon-only Tab needs an aria-label; screen readers have no other name for it.',
  );
  const layout =
    hasIcon && hasText
      ? iconPlacement === 'start'
        ? 'icon-start'
        : 'icon-top'
      : hasIcon
        ? 'icon-only'
        : 'text';
  const styles = tabsStyles({
    variant,
    scrollable,
    layout,
    align: scrollable ? 'stretch' : align,
    swipeable,
  });

  const indicator = useIndicator(
    listRef,
    state.selectedKey,
    variant ?? 'primary',
    state.collection,
  );
  useScrollToSelection(scrollerRef, listRef, state.selectedKey, scrollable);
  // The tabs' colours fade only once the selection has changed. Set in the render that
  // changes it, not with the indicator's placement: that comes from a layout effect whose
  // measuring commits the new colours first, so the first selection recoloured at once.
  const [shownKey, setShownKey] = useState(state.selectedKey);
  const [recolour, setRecolour] = useState(false);
  if (shownKey !== state.selectedKey) {
    setShownKey(state.selectedKey);
    if (shownKey != null) setRecolour(true);
  }
  // The row reveals a tab at the nearest position, never centring the page on it.
  useNearestReveal(listRef);

  return (
    <>
      <div
        ref={scrollerRef}
        {...densityAttribute(density)}
        className={styles.scroller({ class: classNames?.scroller })}
      >
        <div
          {...tabListProps}
          ref={listRef}
          data-slot="list"
          data-animate={indicator?.animate || undefined}
          data-recolour={recolour || undefined}
          className={styles.list({ class: classNames?.list })}
        >
          {items.map((item, index) => (
            <TabButton
              key={item.key}
              item={item}
              index={index}
              state={state}
              hasPanels={hasPanels}
              layout={layout}
              variant={variant ?? 'primary'}
              styles={styles}
              className={classNames?.tab}
              iconClassName={classNames?.icon}
              labelClassName={classNames?.label}
            />
          ))}
          <span
            aria-hidden="true"
            data-slot="indicator"
            data-ready={indicator ? '' : undefined}
            className={styles.indicator({ class: classNames?.indicator })}
            style={{
              // Span every column so the indicator's origin is the row's left edge in both
              // directions; translate then positions it.
              gridColumn: `1 / span ${Math.max(items.length, 1)}`,
              ...(indicator && { width: indicator.width, translate: `${indicator.x}px 0` }),
            }}
          />
        </div>
      </div>
      {hasPanels && (
        <TabPanel
          key={state.selectedKey}
          state={state}
          swipeable={swipeable}
          rtl={rtl}
          className={styles.panel({ class: classNames?.panel })}
        />
      )}
    </>
  );
}

/** Where the indicator goes, and whether it moves there (a selection change) or jumps. */
interface IndicatorPlacement {
  x: number;
  width: number;
  /**
   * The selection changed since the last placement, so the indicator slides and the tabs'
   * colours change in motion. The first placement and resizes (the row's, or the selected
   * tab's content's, e.g. when a web font loads) put it in place at once: M3 motion explains
   * a selection, and nothing slides in on mount.
   */
  animate: boolean;
}

/**
 * Measures the selected tab: its content (primary) or the whole tab (secondary). Again when
 * the tabs change, as tabs added or removed move the selected one without resizing the row,
 * and when the row or the selected tab's content resizes.
 */
function useIndicator(
  listRef: React.RefObject<HTMLDivElement | null>,
  selectedKey: React.Key | null,
  variant: TabsVariant,
  tabs: unknown,
) {
  const [indicator, setIndicator] = useState<IndicatorPlacement | null>(null);
  const placedKey = useRef<React.Key | null>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = (x: number, width: number) => {
      const animate = placedKey.current != null && placedKey.current !== selectedKey;
      placedKey.current = selectedKey;
      // An unchanged place keeps the last placement, so a re-measure never cuts a slide short.
      setIndicator((last) =>
        last && last.x === x && last.width === width ? last : { x, width, animate },
      );
    };
    const measure = () => {
      const tab = [...list.querySelectorAll<HTMLElement>('[role="tab"]')].find(
        (el) => el.dataset.key === String(selectedKey),
      );
      if (!tab) return setIndicator(null);
      // Measured in the list's own pixels: an ancestor scaling in (a dialog opening) shrinks
      // the client rects, and no resize follows when it ends, so divide its scale out.
      const listRect = list.getBoundingClientRect();
      const scale = list.offsetWidth > 0 ? listRect.width / list.offsetWidth : 1;
      // Grid items sit in the content box, so measure from inside the start padding
      // (52px on scrollable rows; on the right in RTL, where paddingLeft is 0).
      const listLeft = listRect.left + parseFloat(getComputedStyle(list).paddingLeft) * scale;
      const tabRect = tab.getBoundingClientRect();
      const tabX = (tabRect.left - listLeft) / scale;
      const tabWidth = tabRect.width / scale;
      if (variant === 'secondary') {
        place(tabX, tabWidth);
        return;
      }
      // Compose: the content width less the 16px padding each side, at least 24px.
      const parts = [...tab.querySelectorAll('[data-tab-part]')].map((el) =>
        el.getBoundingClientRect(),
      );
      const contentWidth = parts.length
        ? (Math.max(...parts.map((r) => r.right)) - Math.min(...parts.map((r) => r.left))) / scale
        : 0;
      const width = Math.max(Math.min(contentWidth, tabWidth - 32), 24);
      place(tabX + (tabWidth - width) / 2, width);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    // The selected tab's content can resize without the row, e.g. when a web font loads.
    const selected = [...list.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (el) => el.dataset.key === String(selectedKey),
    );
    selected?.querySelectorAll('[data-tab-part]').forEach((part) => observer.observe(part));
    return () => observer.disconnect();
  }, [listRef, selectedKey, variant, tabs]);
  return indicator;
}

/**
 * Scrollable rows centre the selected tab on the default spatial spring (Compose); under
 * reduced motion they scroll there at once.
 */
function useScrollToSelection(
  scrollerRef: React.RefObject<HTMLDivElement | null>,
  listRef: React.RefObject<HTMLDivElement | null>,
  selectedKey: React.Key | null,
  scrollable: boolean,
) {
  const spring = useM3Spring('spatial', 'default');
  const reducedMotion = useReducedMotion() ?? false;
  const first = useRef(true);
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const tab = [...(listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])].find(
      (el) => el.dataset.key === String(selectedKey),
    );
    if (!scrollable || !scroller || !tab) return;
    const rtl = getComputedStyle(scroller).direction === 'rtl';
    const max = scroller.scrollWidth - scroller.clientWidth;
    const tabRect = tab.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const delta = tabRect.left + tabRect.width / 2 - (scrollerRect.left + scrollerRect.width / 2);
    // RTL scroll positions run from 0 down to −max.
    const target = Math.min(Math.max(scroller.scrollLeft + delta, rtl ? -max : 0), rtl ? 0 : max);
    if (first.current || reducedMotion) {
      first.current = false;
      scroller.scrollLeft = target;
      return;
    }
    const controls = animate(scroller.scrollLeft, target, {
      ...spring,
      onUpdate: (value) => {
        scroller.scrollLeft = value;
      },
    });
    return () => controls.stop();
    // The spring only matters for the next selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, scrollable]);
}

interface TabButtonProps {
  item: Node<object>;
  index: number;
  state: TabListState<object>;
  hasPanels: boolean;
  layout: 'text' | 'icon-top' | 'icon-start' | 'icon-only';
  variant: TabsVariant;
  styles: ReturnType<typeof tabsStyles>;
  className?: string | undefined;
  iconClassName?: string | undefined;
  labelClassName?: string | undefined;
}

function TabButton({
  item,
  index,
  state,
  hasPanels,
  layout,
  variant,
  styles,
  className,
  iconClassName,
  labelClassName,
}: TabButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabProps, isPressed } = useTab({ key: item.key }, state, ref);
  const { interactionProps, dataAttributes } = useM3Interaction(
    {
      isDisabled: state.disabledKeys.has(item.key),
      isPressed,
      isSelected: state.selectedKey === item.key,
    },
    ref,
  );
  const { icon, badge } = item.props as TabProps;
  const badgeId = useId();
  // Without panels there is nothing for aria-controls to point at.
  const { 'aria-controls': controls, ...ownProps } = tabProps;
  // On a stacked icon the badge overlaps it (`BadgedBox`); otherwise it follows the label.
  const badgeOnIcon =
    badge != null && icon != null && (layout === 'icon-top' || item.rendered == null);
  // The badge describes the tab rather than adding to its name.
  // Wrapped rather than cloned: a badge can arrive as a lazy server reference without props.
  const badgeNode =
    badge != null ? (
      <span id={badgeId} aria-hidden="true" className="contents">
        {badge}
      </span>
    ) : null;
  return (
    <div
      {...mergeProps(ownProps, interactionProps)}
      {...dataAttributes}
      aria-controls={hasPanels ? controls : undefined}
      aria-disabled={state.isDisabled || state.disabledKeys.has(item.key) || undefined}
      aria-describedby={badge != null ? badgeId : undefined}
      data-key={String(item.key)}
      // Each tab resolves its own tokens, so its selection picks its colours.
      data-tokens={mergeDataTokens('md-comp-tabs', ownProps)}
      data-variant={variant}
      data-slot="tab"
      ref={ref}
      style={{ gridColumnStart: index + 1 }}
      className={styles.tab({ class: className })}
    >
      {icon != null && (
        <span
          aria-hidden="true"
          data-tab-part=""
          data-slot="icon"
          className={styles.icon({ class: iconClassName })}
        >
          {badgeOnIcon && badgeNode ? <BadgedBox badge={badgeNode}>{icon}</BadgedBox> : icon}
        </span>
      )}
      {item.rendered != null &&
        (badge != null && !badgeOnIcon ? (
          <span data-tab-part="" className={styles.text()}>
            <span className={styles.label({ class: labelClassName })}>{item.rendered}</span>
            {badgeNode}
          </span>
        ) : (
          <span data-tab-part="" className={styles.label({ class: labelClassName })}>
            {item.rendered}
          </span>
        ))}
    </div>
  );
}

/** The next (or previous) enabled tab after the selected one, if any. */
function adjacentKey(state: TabListState<object>, forward: boolean) {
  const step = (key: Key | null) =>
    key == null
      ? null
      : forward
        ? state.collection.getKeyAfter(key)
        : state.collection.getKeyBefore(key);
  let key = step(state.selectedKey);
  while (key != null && state.disabledKeys.has(key)) key = step(key);
  return key;
}

/**
 * A horizontal touch or pen swipe of at least {@link TAB_SWIPE_THRESHOLD} px selects the
 * neighbouring tab: towards the end edge for the previous one, as content follows the
 * finger. Mouse drags are left to text selection.
 */
function useSwipeToSelect(
  state: TabListState<object>,
  rtl: boolean,
  enabled: boolean,
): HTMLAttributes<HTMLDivElement> {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  if (!enabled) return {};
  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      start.current =
        event.pointerType === 'mouse'
          ? null
          : { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      const origin = start.current;
      start.current = null;
      if (!origin || origin.id !== event.pointerId || state.isDisabled) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) < TAB_SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
      const key = adjacentKey(state, rtl ? dx > 0 : dx < 0);
      if (key != null) state.setSelectedKey(key);
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

function TabPanel({
  state,
  swipeable,
  rtl,
  className,
}: {
  state: TabListState<object>;
  swipeable: boolean;
  rtl: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabPanelProps } = useTabPanel({}, state, ref);
  const swipeProps = useSwipeToSelect(state, rtl, swipeable);
  return (
    <div {...mergeProps(tabPanelProps, swipeProps)} ref={ref} className={className}>
      {(state.selectedItem?.props as TabProps | undefined)?.children}
    </div>
  );
}
