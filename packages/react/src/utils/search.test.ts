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

  it('writes letters of their own as the letters a search types for them, capitals too', () => {
    expect(normalizeSearch('Łódź')).toBe('lodz');
    expect(normalizeSearch('Straße')).toBe('strasse');
    expect(normalizeSearch('STRAẞE')).toBe('strasse');
    expect(normalizeSearch('Øresund')).toBe('oresund');
    expect(normalizeSearch('Ærø')).toBe('aero');
    expect(normalizeSearch('Œuvre, cœur')).toBe('oeuvre, coeur');
    expect(normalizeSearch('Þórshöfn')).toBe('thorshofn');
    expect(normalizeSearch('Guðrún, Ðuro')).toBe('gudrun, duro');
    expect(normalizeSearch('Diyarbakır, İzmir')).toBe('diyarbakir, izmir');
    expect(normalizeSearch('Paral·lel, Ŀ')).toBe('paral·lel, l');
    expect(matchesSearch('Łódź', 'Lodz')).toBe(true);
    expect(matchesSearch('Straße', 'strasse')).toBe(true);
    expect(matchesSearch('Strasse', 'Straße')).toBe(true);
  });
});
