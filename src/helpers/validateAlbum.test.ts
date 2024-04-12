import '@testing-library/jest-dom';

import validateAlbum from "./validateAlbum";

describe('album verification', () => {
  test('correctly identify allowed album', () => {
    expect(validateAlbum('ydSWlZR')).toBeTruthy();  
  });
  test('correctly identify a disallowed album', () => {
    expect(validateAlbum('test')).toBeFalsy();
  });
});