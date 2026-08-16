import { CompactNumberPipe } from './compact-number-pipe';

describe('CompactNumberPipe', () => {
  const pipe = new CompactNumberPipe();

  it('keeps values up to 1000 unchanged', () => {
    expect(pipe.transform(0)).toBe('0');
    expect(pipe.transform(1)).toBe('1');
    expect(pipe.transform(999)).toBe('999');

    // "Exceeds 1000" is strictly greater, so exactly 1000 is not compacted.
    expect(pipe.transform(1000)).toBe('1000');
  });

  it('rounds values above 1000 down to thousands with a K suffix', () => {
    expect(pipe.transform(1001)).toBe('1K');
    expect(pipe.transform(1999)).toBe('1K');
    expect(pipe.transform(15605)).toBe('15K');
    expect(pipe.transform(212245384)).toBe('212245K');
  });
});
