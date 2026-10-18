/**
 * The part of jsdom's API the build scripts use (jsdom ships no types of its own). jsdom is
 * already a dev dependency, for the Vitest environment.
 */
declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string);
    readonly window: Window & typeof globalThis;
  }
}
