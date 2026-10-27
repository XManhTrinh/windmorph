/** Local-storage key for the site's text direction (the "Right to left" switch). */
export const DIRECTION_KEY = 'windmorph-site-dir';

/**
 * Runs before first paint (like `ThemeScript`) and applies the stored direction to
 * `<html>`, so an RTL choice never flashes LTR and holds on every page.
 */
export const DIRECTION_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  DIRECTION_KEY,
)})==='rtl')document.documentElement.dir='rtl'}catch(e){}`;
