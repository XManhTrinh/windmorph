import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE, SITE_NAME, SITE_TAGLINE } from './site-metadata';
import { SITE_THEME } from './site-themes';
import { lightThemeColors } from './theme-colors';
import type { SitePage } from './site-pages';

const here = dirname(fileURLToPath(import.meta.url));

/** The site theme's roles the image uses, so it reads as the site does in light mode. */
const COLORS = lightThemeColors(SITE_THEME, [
  'surface-container-low',
  'on-surface',
  'on-surface-variant',
  'primary',
  'primary-container',
  'tertiary-container',
  'secondary-container',
]);

let logo: Promise<string> | null = null;

/** The Windmorph logo (`public/windmorph-icon.png`) as a data URL, read once per build. */
function logoDataUrl(): Promise<string> {
  logo ??= readFile(resolve(here, '../public/windmorph-icon.png')).then(
    (png) => `data:image/png;base64,${png.toString('base64')}`,
  );
  return logo;
}

/**
 * A page's link-preview image, 1200×630: the logo and name, the page's section and title,
 * and the tagline, in the site theme's colours with two Expressive shapes behind them.
 * Rendered at build time (`app/og/[...path]/route.tsx`).
 */
export async function ogImage(page: SitePage): Promise<ImageResponse> {
  const logoSrc = await logoDataUrl();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: COLORS['surface-container-low'],
        color: COLORS['on-surface'],
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -180,
          bottom: -200,
          width: 620,
          height: 620,
          borderRadius: 9999,
          backgroundColor: COLORS['primary-container'],
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 260,
          top: -150,
          width: 320,
          height: 320,
          borderRadius: 112,
          transform: 'rotate(20deg)',
          backgroundColor: COLORS['tertiary-container'],
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 150,
          width: 140,
          height: 140,
          borderRadius: 48,
          transform: 'rotate(-12deg)',
          backgroundColor: COLORS['secondary-container'],
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src={logoSrc} width={80} height={80} alt="" style={{ borderRadius: 20 }} />
          <div style={{ fontSize: 40, letterSpacing: -0.5 }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>
          <div style={{ fontSize: 30, color: COLORS.primary }}>{page.section}</div>
          <div style={{ fontSize: 80, lineHeight: 1.08, letterSpacing: -1.5, lineClamp: 2 }}>
            {page.title}
          </div>
        </div>
        <div style={{ fontSize: 30, color: COLORS['on-surface-variant'] }}>
          {page.kind === 'home' ? '@windmorph/react' : SITE_TAGLINE}
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
