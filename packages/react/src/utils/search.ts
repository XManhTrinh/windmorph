/**
 * Letters that are letters of their own rather than a letter with an accent, so removing
 * accents leaves them as they are: each is written as the Latin letters a search types
 * for it (lower case; capitals are lowered first, `ẞ` to `ß`).
 */
const LETTERS: Readonly<Record<string, string>> = {
  đ: 'd',
  ð: 'd',
  ø: 'o',
  ł: 'l',
  ŀ: 'l',
  ı: 'i',
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
  þ: 'th',
};
const LETTER = new RegExp('[' + Object.keys(LETTERS).join('') + ']', 'gu');

/**
 * Lower case without accents, so a search for "zurich" finds "Zürich" and "cote" finds
 * "Côte d'Ivoire". Letters of their own are written as the letters a search types for them:
 * `đ` and `ð` as `d`, `ø` as `o`, `ł` and `ŀ` as `l`, `ß` as `ss`, `æ` as `ae`, `œ` as `oe`,
 * `þ` as `th` and the dotless `ı` as `i`, so "dakovo" finds "Đakovo", "lodz" finds "Łódź"
 * and "strasse" finds "Straße". The result can be longer than `text` (`ß` is two letters),
 * so its positions don't map back onto `text`.
 */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(LETTER, (letter) => LETTERS[letter] ?? letter)
    .trim();
}

/** Whether `text` contains `query`, ignoring case and accents. An empty query matches all. */
export function matchesSearch(text: string, query: string): boolean {
  const search = normalizeSearch(query);
  return search === '' || normalizeSearch(text).includes(search);
}
