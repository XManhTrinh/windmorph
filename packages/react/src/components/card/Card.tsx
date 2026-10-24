'use client';

import {
  useEffect,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { useObjectRef } from 'react-aria';
import {
  ButtonBase,
  type ButtonBaseDivActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { cardStyles, type CardVariant } from './card-styles';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

interface CardOwnProps {
  /** The M3 style: filled, elevated or outlined. @default "filled" */
  variant?: CardVariant;
  /**
   * The card is being dragged (picked up to move it): M3 raises it (filled and outlined
   * to level 3, elevated to 4) and, on an interactive card, shows the dragged state layer.
   * Set it from your drag and drop code; it sets `data-dragged`.
   * @default false
   */
  dragged?: boolean;
  /** Classes for the card, merged with its own; consumer classes win. */
  className?: string;
  /** The card's content: its media, headline, text and actions. */
  children?: ReactNode;
}

/**
 * Button props that don't apply to a card (cards aren't toggles or menu triggers), and the
 * ones a card describes itself.
 */
type NotForCards = 'toggle' | 'preventFocusOnPress' | 'className' | 'children';

/** A container card. */
export interface CardStaticProps
  extends CardOwnProps, Omit<ComponentPropsWithRef<'div'>, 'className' | 'children'> {
  /** Makes the card a link (`<a>`). It must not contain other buttons or links then. */
  href?: undefined;
  /** Makes the card pressable (`<div role="button">`). It must not contain other buttons or links then. */
  onPress?: undefined;
  /** Disables a pressable or link card. A container card can't be disabled. @default false */
  disabled?: undefined;
}

/**
 * A pressable card, rendered as `<div role="button">` because cards hold headings, media
 * and blocks that a `<button>` may not. It is named by its text, in reading order, as a link
 * card is: keep the headline first and the text short. Use `aria-label` only for a card that
 * shows no text. It must not contain other buttons or links.
 */
export interface CardActionProps
  extends CardOwnProps, Omit<ButtonBaseDivActionProps, 'as' | 'onPress' | NotForCards> {
  onPress: NonNullable<ButtonBaseDivActionProps['onPress']>;
}

/** A card that is a link, named by its text. It must not contain other buttons or links. */
export interface CardLinkProps extends CardOwnProps, Omit<ButtonBaseLinkProps, NotForCards> {}

export type CardProps = CardStaticProps | CardActionProps | CardLinkProps;

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Warns in development when an interactive card contains its own interactive content. */
function useNoNestedInteractive(ref: RefObject<HTMLElement | null>, interactive: boolean) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !interactive) return;
    const nested = ref.current?.querySelector(FOCUSABLE);
    if (nested) {
      console.warn(
        '[@windmorph/react] A pressable or link Card must not contain buttons, links or form fields; ' +
          'use a static Card with its own actions instead.',
        nested,
      );
    }
  });
}

/**
 * M3 card: filled, elevated or outlined. Static by default; with `onPress` or `href` the
 * whole card is pressable, with M3 state layers, hover elevation and a focus ring.
 * Content is clipped to the 12px corners; add `overflow-visible` to turn that off.
 *
 * @example
 * <Card variant="elevated" className="p-4">…</Card>
 * <Card href="/trips/kyoto">
 *   <img src={photo} alt="" />
 *   <h3 className="p-4 text-title-medium">Kyoto</h3>
 * </Card>
 */
export function Card(props: CardProps) {
  const isLink = props.href !== undefined;
  const isAction = !isLink && props.onPress !== undefined;
  const interactive = isLink || isAction;
  const { variant, dragged = false, className, ref, ...rest } = props;
  const domRef = useObjectRef(ref as Ref<HTMLElement>);
  useNoNestedInteractive(domRef, interactive);

  const classes = cn(cardStyles({ variant, interactive }), className);
  // The component tokens' hooks (card-tokens.ts), also public styling hooks for apps.
  const tokenAttributes = {
    'data-tokens': mergeDataTokens('md-comp-card', rest),
    'data-variant': variant ?? 'filled',
  };

  if (!interactive) {
    const { href, onPress, disabled, ...div } = rest as CardStaticProps;
    return (
      <div
        {...div}
        {...tokenAttributes}
        ref={domRef as Ref<HTMLDivElement>}
        data-dragged={dragged || undefined}
        className={classes}
      />
    );
  }

  // Destructuring a union merges its members (see Button); `rest` holds one member's props.
  const baseProps = {
    ...rest,
    ...tokenAttributes,
    ...(isAction ? { as: 'div' as const } : {}),
    dragged,
    ref: domRef,
    className: classes,
  } as ButtonBaseProps;
  return <ButtonBase {...baseProps} />;
}
