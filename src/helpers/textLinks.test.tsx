import '@testing-library/jest-dom'
import { hydrateLinkElement } from "./textLinks"
// import formatCaption from "./textLinks";

const linkElement = <a href="http://test.com" key="some">some text</a>;

describe('turn a string and url into an anchor element', () => {
  test('combines a valid caption and link', () => {
    expect(hydrateLinkElement('some text', 'http://test.com')).toStrictEqual(linkElement);
  })
})

