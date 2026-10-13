import { COLOR_MODES, CONTRAST_LEVEL_NAMES } from '../tokens/color';
import { MOTION_SCHEMES } from '../tokens/motion';
import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_THEME_STATE,
  type ThemeState,
  type ThemeStorage,
} from './state';

export interface ThemeScriptProps {
  /** Values used when nothing is stored. Must match the `ThemeProvider` defaults. */
  defaults?: Partial<ThemeState>;
  /** Must match `ThemeProvider`'s `storage`. @default "cookie" */
  storage?: Exclude<ThemeStorage, 'none'>;
  /** Must match `ThemeProvider`'s `storageKey`. */
  storageKey?: string;
  /** CSP nonce for the inline script. */
  nonce?: string;
}

/**
 * Builds the inline script source. It runs before first paint, reads the stored
 * selection and writes the `data-*` attributes on `<html>`, so static and exported
 * sites never flash the wrong theme.
 */
export function getThemeScriptSource({
  defaults,
  storage = 'cookie',
  storageKey = DEFAULT_STORAGE_KEY,
}: Omit<ThemeScriptProps, 'nonce'> = {}): string {
  const config = {
    defaults: { ...DEFAULT_THEME_STATE, ...defaults },
    storage,
    key: storageKey,
    cookie: `(?:^|; )${storageKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`,
    allowed: { mode: COLOR_MODES, contrast: CONTRAST_LEVEL_NAMES, motion: MOTION_SCHEMES },
  };
  return `(function(c){try{var r=null;if(c.storage==="cookie"){var m=document.cookie.match(new RegExp(c.cookie));r=m&&m[1]}else{r=localStorage.getItem(c.key)}var p=new URLSearchParams(r?decodeURIComponent(r):""),s={},k;for(k in c.defaults){var v=p.get(k);s[k]=v&&(k==="theme"?/^[a-z][a-z0-9-]*$/.test(v):c.allowed[k].indexOf(v)>-1)?v:c.defaults[k]}var e=document.documentElement;for(k in s)e.setAttribute("data-"+k,s[k])}catch(_){}})(${JSON.stringify(config).replace(/</g, '\\u003c')})`;
}

/**
 * Prevents a theme flash on static or exported sites. Render it in `<head>` and add
 * `suppressHydrationWarning` to `<html>`. With server rendering, prefer
 * `getThemeFromCookies` from `@windmorph/react/next` instead.
 */
export function ThemeScript({ nonce, ...options }: ThemeScriptProps) {
  return (
    <script nonce={nonce} dangerouslySetInnerHTML={{ __html: getThemeScriptSource(options) }} />
  );
}
