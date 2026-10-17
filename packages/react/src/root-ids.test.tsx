import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Autocomplete,
  AutocompleteItem,
  Carousel,
  DateField,
  DatePicker,
  List,
  ListItem,
  ListItemAvatar,
  RangeSlider,
  SearchBar,
  Select,
  SelectItem,
  Slider,
  TimePicker,
} from './index';
import { TouchTarget } from './primitives';

/**
 * Every component takes an `id` (2026-10-17): a field's goes to its input or trigger, so a
 * `<label for>` or an error summary's link reaches it; anything else's goes to its root.
 * `public-api-names.test.ts` checks the types; this checks where each id lands.
 */
describe('component ids', () => {
  it('puts a field’s id on the element that takes its value', () => {
    render(
      <>
        <Select id="sort" label="Sort by">
          <SelectItem key="new">Newest</SelectItem>
        </Select>
        <Autocomplete id="city" label="City">
          <AutocompleteItem key="paris">Paris</AutocompleteItem>
        </Autocomplete>
        <DateField id="birthday" label="Date of birth" />
      </>,
    );
    expect(document.getElementById('sort')?.tagName).toBe('BUTTON');
    expect(document.getElementById('city')?.tagName).toBe('INPUT');
    expect(document.getElementById('birthday')?.tagName).toBe('INPUT');
  });

  it('puts every other component’s id on its root', () => {
    render(
      <>
        <Slider id="volume" aria-label="Volume" />
        <RangeSlider id="price" aria-label="Price" />
        <DatePicker id="picker" />
        <TimePicker id="time" />
        <List id="mail" aria-label="Mail">
          <ListItem key="inbox">Inbox</ListItem>
        </List>
        <Carousel id="photos" aria-label="Photos">
          <img alt="" />
        </Carousel>
        <SearchBar id="search" aria-label="Search" />
      </>,
    );
    expect(document.getElementById('volume')).toHaveAttribute('role', 'group');
    expect(document.getElementById('price')).toHaveAttribute('role', 'group');
    expect(document.getElementById('picker')).toHaveAttribute('data-tokens');
    expect(document.getElementById('time')).toBeInTheDocument();
    expect(document.getElementById('mail')).toHaveAttribute('aria-label', 'Mail');
    expect(document.getElementById('photos')).toHaveAttribute('role', 'region');
    expect(document.getElementById('search')).toBeInTheDocument();
  });

  it('forwards ref, id and style on the small parts', () => {
    const avatar = createRef<HTMLSpanElement>();
    render(
      <>
        <ListItemAvatar ref={avatar} id="alex" style={{ order: 1 }}>
          AL
        </ListItemAvatar>
        <TouchTarget id="target" />
      </>,
    );
    expect(avatar.current).toBe(document.getElementById('alex'));
    expect(avatar.current).toHaveStyle({ order: '1' });
    expect(document.getElementById('target')).toHaveAttribute('data-touch-target');
  });
});
