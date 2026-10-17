import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const hasDom = typeof document !== 'undefined';

afterEach(() => {
  if (!hasDom) return;
  cleanup();
});
