/**
 * Lower case without accents, so a search for "zurich" finds "Zürich" and "cote" finds
 * "Côte d'Ivoire". `đ` (a letter of its own in Croatian, not a d with an
 * accent) is folded to `d` too, so "dakovo" finds "Đakovo".
 */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase().trim();
}

/** Whether `text` contains `query`, ignoring case and accents. An empty query matches all. */
export function matchesSearch(text: string, query: string): boolean {
  const search = normalizeSearch(query);
  return search === '' || normalizeSearch(text).includes(search);
}
