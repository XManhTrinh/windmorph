import type { ReactElement } from 'react';
import {
  AccessibilityIcon,
  CodeIcon,
  HomeIcon,
  MotionIcon,
  PaletteIcon,
  TuneIcon,
} from '../../components/icons';

export interface DocsSection {
  href: string;
  label: string;
  icon: ReactElement;
}

/**
 * The six guide sections, full-name labels, shared by the top bar and the modal drawer.
 * The `/components` gallery is owned by the left rail (not a top-bar section); its route
 * still exists and is reached from the rail, the compact bottom bar and the homepage.
 */
export const DOCS_SECTIONS: DocsSection[] = [
  { href: '/getting-started', label: 'Getting Started', icon: <HomeIcon /> },
  { href: '/theming', label: 'Theming', icon: <PaletteIcon /> },
  { href: '/customisation', label: 'Customisation', icon: <TuneIcon /> },
  { href: '/motion', label: 'Motion', icon: <MotionIcon /> },
  { href: '/accessibility', label: 'Accessibility', icon: <AccessibilityIcon /> },
  { href: '/nextjs', label: 'Next.js', icon: <CodeIcon /> },
];
