import { describe, expect, it } from 'vitest';

import { greet } from '../src';

describe('greet', () => {
  it('returns a friendly greeting for the provided name', () => {
    expect(greet('friend')).toBe('Hello, friend!');
  });
});
