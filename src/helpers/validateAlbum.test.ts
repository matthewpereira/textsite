import '@testing-library/jest-dom';

import validateAlbum from "./validateAlbum";

describe('album verification', () => {
  test('correctly identify allowed album', async () => {
    expect(await validateAlbum('ydSWlZR')).toBeTruthy();
  });
  test('correctly identify a disallowed album', async () => {
    expect(await validateAlbum('test')).toBeFalsy();
  });
});