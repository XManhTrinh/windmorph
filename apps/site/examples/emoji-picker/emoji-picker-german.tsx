'use client';

import { LabelsProvider } from '@windmorph/react';
import { EmojiPicker } from '@windmorph/react-pro/emoji-picker';

const CATEGORIES = {
  recent: 'Zuletzt verwendet',
  custom: 'Eigene',
  people: 'Smileys und Personen',
  nature: 'Tiere und Natur',
  food: 'Essen und Trinken',
  travel: 'Reisen und Orte',
  activities: 'Aktivitäten',
  objects: 'Objekte',
  symbols: 'Symbole',
  flags: 'Flaggen',
};
const TONES = ['Keine Hautfarbe', 'Hell', 'Mittelhell', 'Mittel', 'Mitteldunkel', 'Dunkel'];

/**
 * Another language: Emojibase's German names and keywords, loaded from the app's own bundle on
 * first open, and the picker's words for the whole app through a `LabelsProvider` (or one
 * picker's `labels`). Search for „Katze“ or „Kuchen“.
 */
export function EmojiPickerGerman() {
  return (
    <LabelsProvider
      labels={{
        EmojiPicker: {
          title: 'Emojis',
          search: 'Emojis suchen',
          category: (category) => CATEGORIES[category],
          categories: 'Emoji-Kategorien',
          searchResults: 'Suchergebnisse',
          results: (count, formatted) => (count === 1 ? '1 Emoji' : `${formatted} Emojis`),
          noResults: 'Keine Emojis gefunden',
          loading: 'Emojis werden geladen',
          loadError: 'Emojis konnten nicht geladen werden',
          retry: 'Erneut versuchen',
          skinTone: 'Hautfarbe',
          skinToneButton: (tone) => `Hautfarbe, ${tone}`,
          keyboard: 'Tastatur einblenden',
          tone: (tone) => TONES[tone] ?? '',
        },
      }}
    >
      <EmojiPicker
        lang="de"
        storageKey={null}
        locale="de"
        loadData={() => import('emojibase-data/de/data.json')}
      />
    </LabelsProvider>
  );
}
