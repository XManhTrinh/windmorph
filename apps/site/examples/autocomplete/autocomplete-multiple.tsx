'use client';

import { Autocomplete, AutocompleteItem, type AutocompleteKey } from '@windmorph/react';
import { useState } from 'react';

const TAGS = [
  'Italian',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-free',
  'Takeaway',
  'Delivery',
  'Family-friendly',
].map((name) => ({ id: name.toLowerCase(), name }));

/**
 * Several choices as input chips: remove one with its close button, or with Backspace in
 * the empty field. The menu stays open between picks, and `maxSelections` caps the count.
 */
export function AutocompleteMultiple() {
  const [tags, setTags] = useState<AutocompleteKey[]>(['italian', 'takeaway']);
  return (
    <Autocomplete
      variant="outlined"
      label="Tags"
      selectionMode="multiple"
      defaultItems={TAGS}
      value={tags}
      onChange={setTags}
      maxSelections={5}
      supportingText="Up to five"
    >
      {(tag) => <AutocompleteItem key={tag.id}>{tag.name}</AutocompleteItem>}
    </Autocomplete>
  );
}
