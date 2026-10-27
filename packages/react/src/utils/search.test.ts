import { describe, expect, it } from 'vitest';
import { matchesSearch, normalizeSearch } from './search';

describe('search', () => {
  it('ignores case and accents, and folds đ to d', () => {
    expect(normalizeSearch('  Zürich ')).toBe('zurich');
    expect(normalizeSearch('Đakovo')).toBe('dakovo');
    expect(matchesSearch("Côte d'Ivoire", 'cote')).toBe(true);
    expect(matchesSearch('São Paulo', 'sao')).toBe(true);
    expect(matchesSearch('London', 'paris')).toBe(false);
    expect(matchesSearch('London', '')).toBe(true);
  });
});
