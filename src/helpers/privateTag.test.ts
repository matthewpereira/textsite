import { hasPrivateTag, stripPrivateTag } from './privateTag';

describe('stripPrivateTag', () => {
  it('removes the tag in any case and position', () => {
    expect(stripPrivateTag('[PRIVATE] Beach day')).toBe('Beach day');
    expect(stripPrivateTag('Beach [private] day')).toBe('Beach day');
  });

  it('returns undefined when only the tag is present', () => {
    expect(stripPrivateTag('[PRIVATE]')).toBeUndefined();
    expect(stripPrivateTag(' [PRIVATE] ')).toBeUndefined();
  });

  it('passes through untagged and empty text', () => {
    expect(stripPrivateTag('Beach day')).toBe('Beach day');
    expect(stripPrivateTag(undefined)).toBeUndefined();
  });
});

describe('hasPrivateTag', () => {
  it('detects the tag in any field', () => {
    expect(hasPrivateTag('Title', undefined, 'note [Private]')).toBe(true);
    expect(hasPrivateTag('Title', 'Description')).toBe(false);
  });
});
