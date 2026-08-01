import {
  toOptionalBoolean,
  toTrimmedOptionalString,
} from './query-transformers';

const param = (value: unknown) => ({ value }) as never;

describe('query transformers', () => {
  it.each([
    ['true', true],
    ['false', false],
    [true, true],
    [false, false],
    ['', undefined],
  ])('parses boolean %p', (input, expected) =>
    expect(toOptionalBoolean(param(input))).toBe(expected),
  );
  it('leaves an invalid boolean for validation to reject', () =>
    expect(toOptionalBoolean(param('yes'))).toBe('yes'));
  it('trims strings and removes empty filters', () => {
    expect(toTrimmedOptionalString(param('  mleko '))).toBe('mleko');
    expect(toTrimmedOptionalString(param('  '))).toBeUndefined();
  });
});
