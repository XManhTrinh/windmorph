'use client';

import { useEffect, type ComponentPropsWithRef, type Ref, type RefObject } from 'react';
import { useObjectRef } from 'react-aria';
import {
  ButtonBase,
  type ButtonBaseDivActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { cardStyles, type CardVariant } from './card-styles';

interface CardOwnProps {
  /** @default "filled" */
  variant?: CardVariant;
  /**
   * The card is being dragged (picked up to move it): M3 raises it (filled and outlined
   * to level 3, elevated to 4) and, on an interactive card, shows the dragged state layer.
   * Set it from your drag and drop code; it sets `data-dragged`.
   */
  dragged?: boolean;
}

/** A container card. */
export interface CardStaticProps extends CardOwnProps, ComponentPropsWithRef<'div'> {
  href?: undefined;
  onPress?: undefined;
  disabled?: undefined;
}

/**
 * A pressable card, rendered as `<div role="button">` because cards hold headings, media
 * and blocks that a `<button>` may not. Name it with `aria-labelledby` (its headline) or
 * `aria-label`; it must not contain other buttons or links.
 */
export interface CardActionProps
  extends CardOwnProps, Omit<ButtonBaseDivActionProps, 'elementType' | 'onPress'> {
  onPress: NonNullable<ButtonBaseDivActionProps['onPress']>;
}

/** A card that is a link. It must not contain other buttons or links. */
export interface CardLinkProps extends CardOwnProps, ButtonBaseLinkProps {}

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
 * <Card href="/trips/kyoto" aria-labelledby="kyoto-title">
 *   <img src={photo} alt="" />
 *   <h3 id="kyoto-title" className="p-4 text-title-medium">Kyoto</h3>
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
  const tokenAttributes = { 'data-tokens': 'md-comp-card', 'data-variant': variant ?? 'filled' };

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
    ...(isAction ? { elementType: 'div' as const } : {}),
    dragged,
    ref: domRef,
    className: classes,
  } as ButtonBaseProps;
  return <ButtonBase {...baseProps} />;
}
