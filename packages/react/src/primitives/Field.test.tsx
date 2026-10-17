import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../test/axe';
import { CharacterCounter, ErrorText, FieldErrorIcon, FieldLabel, SupportingText } from './Field';

describe('Field parts', () => {
  it('composes into an accessible field', async () => {
    const { container } = render(
      <div>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" aria-describedby="email-help email-error" maxLength={20} />
        <SupportingText id="email-help">We never share it.</SupportingText>
        <ErrorText id="email-error">Enter a valid email.</ErrorText>
        <CharacterCounter count={4} max={20} />
      </div>,
    );
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'We never share it. Enter a valid email.',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('styles each part with M3 roles and lets consumer classes win', () => {
    render(
      <>
        <SupportingText>help</SupportingText>
        <ErrorText className="text-tertiary">error</ErrorText>
      </>,
    );
    expect(screen.getByText('help')).toHaveClass('text-body-small', 'text-on-surface-variant');
    expect(screen.getByText('error')).toHaveClass('text-tertiary');
    expect(screen.getByText('error')).not.toHaveClass('text-error');
  });

  it('flags the counter when over the limit and hides it from assistive tech', () => {
    render(<CharacterCounter count={21} max={20} />);
    const counter = screen.getByText('21/20');
    expect(counter).toHaveAttribute('data-over-limit');
    expect(counter).toHaveAttribute('aria-hidden', 'true');
  });

  it('reads a labelled counter as its label', () => {
    render(<CharacterCounter id="count" count={12} max={80} label="Character count: 12 of 80" />);
    const counter = document.getElementById('count')!;
    expect(counter).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('12/80')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Character count: 12 of 80')).toHaveClass('sr-only');
  });

  it('gives the error text the alert role, which a role prop can change', () => {
    const { rerender } = render(<ErrorText>Enter a valid email.</ErrorText>);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email.');
    rerender(<ErrorText role="status">Enter a valid email.</ErrorText>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('names the error icon', async () => {
    const { container } = render(<FieldErrorIcon label="Error" />);
    expect(screen.getByRole('img', { name: 'Error' }).querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
