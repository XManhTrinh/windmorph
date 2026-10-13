import type { ReactElement } from 'react';
import { iconFacesStyles, type IconTransition } from './icon-faces-styles';

export interface IconFacesProps {
  /** The resting icon (closed, or collapsed). */
  icon: ReactElement;
  /** The icon shown while `alternate` is true (open, or expanded). */
  alternateIcon: ReactElement;
  /** Shows `alternateIcon`. */
  alternate: boolean;
  /** @default "swap" */
  transition?: IconTransition;
}

/**
 * The two faces of a two-icon button, for an icon slot styled with `iconFacesStyles().cell`.
 * Both stay mounted in one grid cell and hand over with `transition`.
 */
export function IconFaces({ icon, alternateIcon, alternate, transition }: IconFacesProps) {
  const face = (kind: 'primary' | 'alternate', shown: boolean, content: ReactElement) => (
    <span
      data-icon-face={kind}
      data-active={shown || undefined}
      className={iconFacesStyles({ transition, face: kind }).face()}
    >
      {content}
    </span>
  );
  return (
    <>
      {face('primary', !alternate, icon)}
      {face('alternate', alternate, alternateIcon)}
    </>
  );
}
