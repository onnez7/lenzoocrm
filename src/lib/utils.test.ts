import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters falsy values', () => {
    expect(cn('foo', false && 'never', undefined, null, 'bar')).toBe('foo bar');
  });

  it('resolves conflicting Tailwind classes — last one wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600');
  });

  it('handles conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('returns empty string when no inputs', () => {
    expect(cn()).toBe('');
  });

  it('resolves responsive prefix conflicts correctly', () => {
    expect(cn('md:p-2', 'md:p-4')).toBe('md:p-4');
  });
});
