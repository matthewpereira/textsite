import React         from 'react';
import allowedAlbums from '../allowedAlbums.js';

const AlbumList = () => {

    const onAlbumListChange = (e) => {
        window.location = `${window.location.origin}/?${e.target.value}`;
    }

    const albumListItems = () => {
        const albums = Object.keys(allowedAlbums)
            .slice(1, allowedAlbums.length);

        const dropdown = ['Click here'].concat(albums);

        return dropdown.map((album, iterator) =>
            <option
                key={iterator}
                value={allowedAlbums[album]}
            >
                {album}
            </option>
        );
    };

    return (
        <div
            style={{
                'alignItems': 'center',
                'display': 'flex',
                'flexDirection': 'column',
                'gap': '48px',
                'justifyContent': 'center',
                'margin': '48px auto 0',
                'width': '100vw',
                'zIndex': '1000',
            }}
        >
            Select an album
            <select onChange={onAlbumListChange}>
                {albumListItems()}
            </select>
            or scroll down:
        </div>

    );
}

export default AlbumList;

