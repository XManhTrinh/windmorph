import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

const hasDom = typeof document !== 'undefined';

// `findBy*` and `waitFor` wait up to 10s, not 1s, as in `@windmorph/test-utils/setup`.
configure({ asyncUtilTimeout: 10_000 });

afterEach(() => {
  if (!hasDom) return;
  cleanup();
});
