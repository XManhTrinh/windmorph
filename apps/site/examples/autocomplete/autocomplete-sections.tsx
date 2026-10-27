'use client';

import { Autocomplete, AutocompleteItem, AutocompleteSection } from '@windmorph/react';

const MENU = [
  { course: 'Starters', dishes: ['Gỏi cuốn', 'Spring rolls', 'Garden salad'] },
  { course: 'Mains', dishes: ['Phở bò', 'Bún chả', 'Bánh mì', 'Ratatouille'] },
  { course: 'Desserts', dishes: ['Crème brûlée', 'Apfelstrudel', 'Lemon tart'] },
];

/**
 * M3's grouped menu layout: `AutocompleteSection`s give the options headings with dividers
 * between them, and a section with no matches hides with its heading as you type.
 */
export function AutocompleteSections() {
  return (
    <Autocomplete variant="outlined" label="Dish" supportingText="Type to search the menu">
      {MENU.map(({ course, dishes }) => (
        <AutocompleteSection key={course} title={course}>
          {dishes.map((dish) => (
            <AutocompleteItem key={dish}>{dish}</AutocompleteItem>
          ))}
        </AutocompleteSection>
      ))}
    </Autocomplete>
  );
}
