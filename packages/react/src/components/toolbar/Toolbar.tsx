'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import { mergeProps, mergeRefs, useFocusRing, useObjectRef, useToolbar } from 'react-aria';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import {
  dockedToolbarStyles,
  floatingToolbarStyles,
  toolbarCollapseAnchor,
  toolbarFabStyles,
  type DockedToolbarArrangement,
  type FloatingToolbarColor,
  type ToolbarOrientation,
} from './toolbar-styles';

const ToolbarColorContext = createContext<FloatingToolbarColor>('standard');

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

type DivProps<Own> = Omit<
  ComponentPropsWithRef<'div'>,
  keyof Own | 'aria-label' | 'aria-labelledby' | 'color'
>;

/** Applies React Aria's toolbar behaviour (role, arrow keys) with the DOM's direction. */
function useToolbarRoot(
  ref: Ref<HTMLDivElement> | undefined,
  directionRef: RefCallback<HTMLElement>,
  props: { orientation: ToolbarOrientation; 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const merged = useMemo(
    () => mergeRefs<HTMLDivElement>(ref, directionRef as RefCallback<HTMLDivElement>),
    [ref, directionRef],
  );
  const rootRef = useObjectRef<HTMLDivElement>(merged);
  const { toolbarProps } = useToolbar(props, rootRef);
  return { rootRef, toolbarProps };
}

export interface DockedToolbarClassNames {
  root?: string;
}

interface DockedToolbarOwnProps {
  /** Spread the items across the toolbar, or centre them 32px apart. @default "space-between" */
  arrangement?: DockedToolbarArrangement;
  /** The toolbar's controls, e.g. icon buttons, buttons or a FAB. */
  children: ReactNode;
  classNames?: DockedToolbarClassNames;
}

export type DockedToolbarProps = DockedToolbarOwnProps & Naming & DivProps<DockedToolbarOwnProps>;

/**
 * M3 Expressive docked toolbar: a full-width 64px bar of actions, usually along the bottom
 * of the window (it replaces the bottom app bar). Arrow keys move between its controls.
 *
 * @example
 * <DockedToolbar aria-label="Message actions" className="fixed inset-x-0 bottom-0">
 *   <IconButton icon={<ArchiveIcon />} aria-label="Archive" />
 *   <IconButton icon={<DeleteIcon />} aria-label="Delete" />
 * </DockedToolbar>
 */
export function DockedToolbar(props: DockedToolbarProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <DockedToolbarRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function DockedToolbarRoot({
  arrangement,
  children,
  classNames,
  className,
  ref,
  directionRef,
  ...rest
}: DockedToolbarProps & { directionRef: RefCallback<HTMLElement> }) {
  const { rootRef, toolbarProps } = useToolbarRoot(ref, directionRef, {
    ...rest,
    orientation: 'horizontal',
  });
  return (
    <div
      {...mergeProps(rest, toolbarProps)}
      ref={rootRef}
      className={dockedToolbarStyles({ arrangement }).root({
        class: cn(classNames?.root, className),
      })}
    >
      {children}
    </div>
  );
}

export interface FloatingToolbarClassNames {
  root?: string;
  /** The main content group. */
  items?: string;
  leading?: string;
  trailing?: string;
  /** The toolbar's surface when it has a FAB. */
  surface?: string;
  /** The box the FAB fills (56px, 80px while collapsed). */
  fab?: string;
}

interface FloatingToolbarBaseProps {
  /** @default "horizontal" */
  orientation?: ToolbarOrientation;
  /** @default "standard" (`surface-container`); "vibrant" is `primary-container`. */
  color?: FloatingToolbarColor;
  /**
   * Shows the leading and trailing content, or (with a FAB) the toolbar itself. Collapse
   * it while the page scrolls, e.g. with `useToolbarScrollExpansion`. Keyboard focus
   * inside the toolbar expands it, so every control stays reachable. @default true
   */
  expanded?: boolean;
  /** The main controls, always shown. */
  children: ReactNode;
  classNames?: FloatingToolbarClassNames;
}

type FloatingToolbarContent =
  | {
      /** Controls before the main content, hidden while collapsed. */
      leading?: ReactNode;
      /** Controls after the main content, hidden while collapsed. */
      trailing?: ReactNode;
      fab?: undefined;
      fabPosition?: undefined;
    }
  | {
      leading?: undefined;
      trailing?: undefined;
      /**
       * A FAB beside the toolbar, usually a {@link ToolbarFab}. Collapsing hides the
       * toolbar and grows the FAB from 56px to 80px.
       */
      fab: ReactElement;
      /**
       * Side of the toolbar the FAB sits on. `top` is the same as `start` and `bottom` as
       * `end`, so the value can stay put when the orientation changes. @default "end"
       */
      fabPosition?: 'start' | 'end' | 'top' | 'bottom';
    };

type FloatingToolbarOwnProps = FloatingToolbarBaseProps & FloatingToolbarContent;

export type FloatingToolbarProps = FloatingToolbarOwnProps &
  Naming &
  DivProps<
    FloatingToolbarBaseProps & Record<'leading' | 'trailing' | 'fab' | 'fabPosition', unknown>
  >;

/**
 * M3 Expressive floating toolbar: a pill of controls that floats above the content,
 * horizontal or vertical, in standard or vibrant colours. Leading and trailing content
 * collapse with `expanded`; or pair it with a FAB, and collapsing hides the toolbar while
 * the FAB grows. Arrow keys move between its controls.
 *
 * @example
 * <FloatingToolbar aria-label="Formatting" expanded={expanded} className="fixed bottom-4 start-1/2"
 *   leading={<IconButton icon={<UndoIcon />} aria-label="Undo" />}>
 *   <IconButton toggle icon={<BoldIcon />} aria-label="Bold" />
 * </FloatingToolbar>
 *
 * <FloatingToolbar aria-label="Actions" fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}>
 *   <IconButton icon={<SearchIcon />} aria-label="Search" />
 * </FloatingToolbar>
 */
export function FloatingToolbar(props: FloatingToolbarProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <FloatingToolbarRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function FloatingToolbarRoot({
  orientation = 'horizontal',
  color = 'standard',
  expanded: expandedProp = true,
  leading,
  trailing,
  fab,
  fabPosition,
  children,
  classNames,
  className,
  style,
  ref,
  directionRef,
  ...rest
}: FloatingToolbarProps & { directionRef: RefCallback<HTMLElement> }) {
  const { rootRef, toolbarProps } = useToolbarRoot(ref, directionRef, { ...rest, orientation });
  // Keyboard focus inside expands the toolbar, so collapsed controls stay reachable.
  const { isFocusVisible, focusProps } = useFocusRing({ within: true });
  const expanded = expandedProp || isFocusVisible;
  const hasFab = fab != null;
  const fabAt = fabPosition === 'start' || fabPosition === 'top' ? 'start' : 'end';
  const styles = floatingToolbarStyles({ orientation, color, hasFab, fabAt });
  const [contentRef, toolbarSize] = useContentSize(hasFab, orientation);

  const collapsible = (slot: 'leading' | 'trailing', content: ReactNode) =>
    content != null && (
      <div data-collapsed={!expanded || undefined} inert={!expanded} className={styles.collapse()}>
        <div
          data-collapsed={!expanded || undefined}
          className={styles.clip({ class: toolbarCollapseAnchor({ slot, orientation }) })}
        >
          <div className={styles.items({ class: classNames?.[slot] })}>{content}</div>
        </div>
      </div>
    );

  return (
    <div
      {...mergeProps(rest, toolbarProps, focusProps)}
      ref={rootRef}
      data-expanded={expanded}
      style={
        toolbarSize === undefined
          ? style
          : ({ '--m3-toolbar-size': `${toolbarSize}px`, ...style } as CSSProperties)
      }
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ToolbarColorContext value={color}>
        {hasFab ? (
          <>
            <div className={styles.toolbarSlot()}>
              <div
                data-collapsed={!expanded || undefined}
                inert={!expanded}
                className={styles.surface({ class: classNames?.surface })}
              >
                <div ref={contentRef} className={styles.content({ class: classNames?.items })}>
                  {children}
                </div>
              </div>
            </div>
            <div className={styles.fabSlot()}>
              <div
                data-collapsed={!expanded || undefined}
                className={styles.fabBox({ class: classNames?.fab })}
              >
                {fab}
              </div>
            </div>
          </>
        ) : (
          <>
            {collapsible('leading', leading)}
            <div className={styles.items({ class: classNames?.items })}>{children}</div>
            {collapsible('trailing', trailing)}
          </>
        )}
      </ToolbarColorContext>
    </div>
  );
}

/**
 * Measures the toolbar content's natural length along the toolbar, so the slot keeps the
 * expanded size and the surface can animate between it and 0.
 */
function useContentSize(enabled: boolean, orientation: ToolbarOrientation) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const measure = () =>
      setSize(orientation === 'horizontal' ? element.offsetWidth : element.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, orientation]);
  return [ref, size] as const;
}

export interface ToolbarFabClassNames {
  root?: string;
  icon?: string;
}

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

interface ToolbarFabOwnProps {
  /** The icon. Hidden from assistive tech; `aria-label` names the FAB. */
  icon: ReactElement;
  /** Defaults to the toolbar's colour: `primary-container` (standard) or `tertiary-container` (vibrant). */
  color?: FloatingToolbarColor;
  classNames?: ToolbarFabClassNames;
}

type OmitToolbarFab<T> = Omit<
  T,
  keyof ToolbarFabOwnProps | 'children' | 'disabled' | 'toggle' | 'aria-label' | 'aria-labelledby'
>;

export type ToolbarFabProps = ToolbarFabOwnProps &
  AccessibleName &
  (OmitToolbarFab<ButtonBaseActionProps> | OmitToolbarFab<ButtonBaseLinkProps>);

/**
 * The FAB of a {@link FloatingToolbar} (Compose's `StandardFloatingActionButton` /
 * `VibrantFloatingActionButton`): it fills the toolbar's FAB box, 56px or 80px while the
 * toolbar is collapsed, with 16px corners at level 2.
 */
export function ToolbarFab({ icon, color, classNames, className, ...base }: ToolbarFabProps) {
  const toolbarColor = useContext(ToolbarColorContext);
  const styles = toolbarFabStyles({ color: color ?? toolbarColor });
  const baseProps = {
    ...base,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  return (
    <ButtonBase {...baseProps}>
      <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
        {icon}
      </span>
    </ButtonBase>
  );
}
