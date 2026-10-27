import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Autocomplete, AutocompleteItem, DateField, Select, SelectItem, TextField } from './index';

/**
 * The server's HTML of a field names only parts it renders (2026-10-24): React Aria's field
 * hooks add the supporting text's and error's ids (and a combobox's value id) whether or not
 * the part is in the page, and drop them only after hydration, so a screen reader reading the
 * page before then followed `aria-describedby` to nothing.
 */
const FIELDS: Record<string, ReactElement> = {
  'TextField, invalid without an error': <TextField label="Name" invalid />,
  'TextField, with supporting text': <TextField label="Name" supportingText="As on your card" />,
  'Select, invalid without an error': (
    <Select label="Sort by" invalid>
      <SelectItem key="new">Newest</SelectItem>
    </Select>
  ),
  'Autocomplete, invalid without an error': (
    <Autocomplete label="City" invalid>
      <AutocompleteItem key="paris">Paris</AutocompleteItem>
    </Autocomplete>
  ),
  'Autocomplete, several values': (
    <Autocomplete label="Cities" selectionMode="multiple">
      <AutocompleteItem key="paris">Paris</AutocompleteItem>
    </Autocomplete>
  ),
  DateField: <DateField label="Start" />,
};

describe("fields' server HTML", () => {
  for (const [name, element] of Object.entries(FIELDS)) {
    it(`${name} refers only to elements it renders`, () => {
      const html = renderToString(element);
      const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
      const refs = [
        ...html.matchAll(/aria-(?:describedby|labelledby|errormessage)="([^"]+)"/g),
      ].flatMap((match) => match[1]!.split(' '));
      expect(refs.length).toBeGreaterThan(0);
      expect(refs.filter((id) => !ids.has(id))).toEqual([]);
    });
  }

  it('still describes a field by its supporting text', () => {
    const html = renderToString(<TextField label="Name" supportingText="As on your card" />);
    const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1];
    expect(describedBy).toBeDefined();
    expect(html).toContain(`id="${describedBy}"`);
  });
});
