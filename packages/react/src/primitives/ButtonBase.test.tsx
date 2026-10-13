import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonBase } from './ButtonBase';

describe('ButtonBase', () => {
  it('sets data-dragged from the dragged input, for every element type', () => {
    render(
      <>
        <ButtonBase dragged>Button</ButtonBase>
        <ButtonBase dragged elementType="div">
          Div
        </ButtonBase>
        <ButtonBase dragged href="/trips">
          Link
        </ButtonBase>
        <ButtonBase dragged toggle>
          Toggle
        </ButtonBase>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Button' })).toHaveAttribute('data-dragged');
    expect(screen.getByRole('button', { name: 'Div' })).toHaveAttribute('data-dragged');
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('data-dragged');
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('data-dragged');
  });

  it("keeps a consumer's data-dragged instead of overwriting it", () => {
    const { rerender } = render(<ButtonBase data-dragged="">Card</ButtonBase>);
    expect(screen.getByRole('button')).toHaveAttribute('data-dragged');
    rerender(<ButtonBase>Card</ButtonBase>);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-dragged');
  });
});
