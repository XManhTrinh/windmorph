'use client';

import { LabelsProvider } from '@windmorph/react';
import { EmojiPickerTrigger } from '@windmorph/react-pro/emoji-picker';
import { useState } from 'react';

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
  const [picked, setPicked] = useState<string | null>(null);
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
          hide: 'Emojis ausblenden',
          tone: (tone) => TONES[tone] ?? '',
        },
      }}
    >
      <div className="flex items-center gap-2" lang="de">
        <EmojiPickerTrigger
          aria-label="Emoji auswählen"
          storageKey={null}
          locale="de"
          loadData={() => import('emojibase-data/de/data.json')}
          onEmojiSelect={({ emoji, label }) => setPicked(`${emoji} ${label}`)}
        />
        <p className="text-body-large text-on-surface">{picked ?? 'Noch nichts ausgewählt'}</p>
      </div>
    </LabelsProvider>
  );
}
