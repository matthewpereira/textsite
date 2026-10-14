const PRIVATE_TAG = /\[PRIVATE\]/gi;

// True when any caption field carries the [PRIVATE] marker.
export const hasPrivateTag = (...fields: (string | undefined)[]): boolean =>
  fields.some((field) => !!field && /\[PRIVATE\]/i.test(field));

// Remove the [PRIVATE] marker so it never renders. Returns undefined when
// nothing but the marker (and whitespace) was present.
export const stripPrivateTag = (text?: string): string | undefined => {
  if (!text) return undefined;
  const stripped = text.replace(PRIVATE_TAG, '').replace(/\s{2,}/g, ' ').trim();
  return stripped || undefined;
};
