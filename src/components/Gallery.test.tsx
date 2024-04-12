import '@testing-library/jest-dom'
import { isAlbumPage, filterArrayToPage } from "./Gallery";

const albumArray = [
    {
        "id": "Vcu9we7",
        "title": "Prospect Bay",
        "description": "11, 2022",
        "datetime": 1668698480,
        "type": "image/jpeg",
        "animated": false,
        "width": 1470,
        "height": 980,
        "size": 539933,
        "views": 728,
        "bandwidth": 393071224,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/Vcu9we7.jpg"
    },
    {
        "id": "xJGpLHs",
        "title": "James",
        "description": "12, 2021",
        "datetime": 1668994780,
        "type": "image/jpeg",
        "animated": false,
        "width": 654,
        "height": 980,
        "size": 63143,
        "views": 640,
        "bandwidth": 40411520,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/xJGpLHs.jpg"
    },
    {
        "id": "rOiEsbg",
        "title": "Halfway Lake",
        "description": "10, 2020",
        "datetime": 1609949049,
        "type": "image/jpeg",
        "animated": false,
        "width": 1820,
        "height": 874,
        "size": 752737,
        "views": 1690,
        "bandwidth": 1272125530,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/rOiEsbg.jpg"
    },
    {
        "id": "orsoqBq",
        "title": "Nightfall",
        "description": "10, 2020",
        "datetime": 1611014540,
        "type": "image/jpeg",
        "animated": false,
        "width": 654,
        "height": 980,
        "size": 360744,
        "views": 1938,
        "bandwidth": 699121872,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/orsoqBq.jpg"
    },
    {
        "id": "97yh5Z0",
        "title": "Rue Wargha",
        "description": "02, 2020",
        "datetime": 1609890792,
        "type": "image/jpeg",
        "animated": false,
        "width": 1568,
        "height": 980,
        "size": 566531,
        "views": 1525,
        "bandwidth": 863959775,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/97yh5Z0.jpg"
    }
];

const filteredArray = [{
        "id": "rOiEsbg",
        "title": "Halfway Lake",
        "description": "10, 2020",
        "datetime": 1609949049,
        "type": "image/jpeg",
        "animated": false,
        "width": 1820,
        "height": 874,
        "size": 752737,
        "views": 1690,
        "bandwidth": 1272125530,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/rOiEsbg.jpg"
    },
    {
        "id": "orsoqBq",
        "title": "Nightfall",
        "description": "10, 2020",
        "datetime": 1611014540,
        "type": "image/jpeg",
        "animated": false,
        "width": 654,
        "height": 980,
        "size": 360744,
        "views": 1938,
        "bandwidth": 699121872,
        "vote": null,
        "favorite": false,
        "nsfw": null,
        "section": null,
        "account_url": null,
        "account_id": null,
        "is_ad": false,
        "in_most_viral": false,
        "has_sound": false,
        "tags": [],
        "ad_type": 0,
        "ad_url": "",
        "edited": "0",
        "in_gallery": false,
        "link": "https://i.imgur.com/orsoqBq.jpg"
    }
];

describe('what type of page', () => {
  test('detects home page', () => {
    expect(isAlbumPage('')).toBeFalsy();
  });

  test('detects album page', () => {
    expect(isAlbumPage('?EB25A')).toBeTruthy();
  });

  test('detects auth0 querystring', () => {
    expect(isAlbumPage('?code=235125')).toBeFalsy();
  });
});


describe('filter arrays to page', () => {
  test('splits array into groups of two', () => {
    expect(filterArrayToPage(albumArray, 1, 2)).toStrictEqual(filteredArray);
  });

  test('does not split', () => {
    expect(filterArrayToPage(albumArray, 0, 5)).toStrictEqual(albumArray);
  });
});
