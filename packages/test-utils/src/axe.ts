import axe from 'axe-core';

/** Runs axe on a rendered container and returns the violations (expected to be empty). */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    // jsdom cannot compute rendered colours, so contrast is covered by visual tests.
    rules: {
      'color-contrast': { enabled: false },
      // Page-level best practice (content inside landmarks): test pages have no landmarks.
      region: { enabled: false },
    },
  });
  return results.violations.map((violation) => ({ id: violation.id, help: violation.help }));
}
