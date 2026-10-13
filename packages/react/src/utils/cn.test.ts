import { describe, expect, it } from 'vitest';
import { cn } from './cn';
import { tv } from './tv';

describe('cn', () => {
  it('lets later colour roles override earlier ones', () => {
    expect(cn('bg-primary text-on-primary', 'bg-tertiary')).toBe('text-on-primary bg-tertiary');
  });

  it('keeps M3 type roles and colour roles apart', () => {
    expect(cn('text-label-large text-on-primary')).toBe('text-label-large text-on-primary');
    expect(cn('text-label-large', 'text-body-small-emphasized')).toBe('text-body-small-emphasized');
    expect(cn('text-on-primary', 'text-error')).toBe('text-error');
  });

  it('merges M3 corner, elevation, easing and duration utilities', () => {
    expect(cn('rounded-corner-full', 'rounded-corner-medium')).toBe('rounded-corner-medium');
    expect(cn('rounded-corner-full', 'rounded-lg')).toBe('rounded-lg');
    expect(cn('shadow-elevation-1', 'shadow-elevation-3')).toBe('shadow-elevation-3');
    expect(cn('ease-m3-spatial-fast', 'ease-m3-effects-slow')).toBe('ease-m3-effects-slow');
    expect(cn('duration-m3-spatial-fast', 'duration-300')).toBe('duration-300');
  });

  it('lets consumer layout classes win', () => {
    expect(cn('relative inline-flex overflow-hidden', 'fixed overflow-visible flex')).toBe(
      'fixed overflow-visible flex',
    );
  });

  it('supports M3 breakpoint variants', () => {
    expect(cn('medium:bg-primary', 'medium:bg-secondary')).toBe('medium:bg-secondary');
  });
});

describe('tv', () => {
  it('uses the same merge rules as cn', () => {
    const styles = tv({ base: 'text-label-large text-on-primary bg-primary' });
    expect(styles({ class: 'bg-secondary text-on-secondary' })).toBe(
      'text-label-large bg-secondary text-on-secondary',
    );
  });
});
