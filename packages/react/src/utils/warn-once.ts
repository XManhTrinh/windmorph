import { useEffect, useRef } from 'react';

const warnedKeys = new Set<string>();

/**
 * Logs a development warning the first time a key is seen, and never again for that key in
 * the page's lifetime. Silent in production. For code that has no component instance to
 * remember the warning, such as a collection builder.
 */
export function warnOnce(key: string, ...message: unknown[]): void {
  if (process.env.NODE_ENV === 'production' || warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(...message);
}

/**
 * Logs a development warning once per component instance, the first time `condition` holds
 * after a render, however often it flips back and forth afterwards. Silent in production.
 * `message` is read when it warns, so it can describe the render that triggered it.
 */
export function useWarnOnce(condition: boolean, ...message: unknown[]): void {
  const warned = useRef(false);
  // No dependency list: the check is cheap, and it reads the render's own message.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !condition || warned.current) return;
    warned.current = true;
    console.warn(...message);
  });
}
