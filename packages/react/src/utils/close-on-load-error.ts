/**
 * What a component does when the code it opens with fails to load (`onError` of `onDemand`'s
 * `useLoaded`): it closes, so it isn't left open over nothing, and says so in development; its
 * next open tries again (library-internal). Apart from `load-on-demand.tsx`, so only the
 * components that open with such code carry it.
 */
export function closeOnLoadError(component: string, close: () => void) {
  return (error: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[@windmorph/react] A ${component} couldn't load the code it opens with, so it closed; it tries again when it next opens, or after a pause while it's held open.`,
        error,
      );
    }
    close();
  };
}
