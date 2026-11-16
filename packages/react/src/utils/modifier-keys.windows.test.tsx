import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setInteractionModality } from 'react-aria';
// Tests only: React Aria's main entry has no reader for the modality (3.53).
import { getInteractionModality } from 'react-aria/private/interactions/useFocusVisible';
import { describe, expect, it } from 'vitest';
import { Button } from '../components/button/Button';

// Off a Mac, React Aria doesn't count Alt going down (with `altKey` set) as keyboard use.
Object.defineProperty(window.navigator, 'platform', { value: 'Win32', configurable: true });

describe('modifier keys pressed alone, off a Mac', () => {
  // The guard put the pointer's modality back on any Alt, so a modality React Aria had left
  // alone (a screen reader's, after a press) lost its rings as Alt went down (2026-11-16).
  it("leave the modality alone as Alt goes down, which React Aria doesn't count", async () => {
    render(<Button>Save</Button>);
    const save = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    setInteractionModality('virtual');
    fireEvent.keyDown(save, { key: 'Alt', altKey: true });
    expect(getInteractionModality()).toBe('virtual');
  });
});
