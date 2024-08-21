import '@testing-library/jest-dom'
import removeHashFromHashString from "./removeHashFromHashString";

test('removes hash', () => {
  expect(removeHashFromHashString('#test')).toBe('test');
})
