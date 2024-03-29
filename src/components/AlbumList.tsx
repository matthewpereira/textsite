import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { PaginationContextProvider } from '../context/PaginationContext.tsx'; 
import Menu from './Menu.tsx';
import ThumbnailGallery from "./ThumbnailGallery.tsx";
import AlbumSelector from "./AlbumSelector";

import allowedAlbums from "../allowedAlbums";
import { IMGUR_AUTHORIZATION } from '../config';

// Because we have the default gallery in the index 0 spot
const stripFirstAlbum = (originalObject: any) =>
  Object.fromEntries(
    Object.entries(originalObject).slice(1, originalObject.length)
  );

const AlbumList = () => {

  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return window.location.href = "/";
  }

  const [albumCovers, setAlbumCovers] = useState([]);

  useEffect(() => {
    getAlbumCovers(stripFirstAlbum(allowedAlbums));
  }, []);

  const getAlbumCovers = async (albumList: any) => {

    let remainingAlbums = albumList;

    const COHORT_SIZE = 32;
    for (let i = 0; i < Object.values(allowedAlbums).length; i) {
      const albumsToFetch = Object.values(remainingAlbums).slice(0, COHORT_SIZE);

      remainingAlbums = Object.values(remainingAlbums).slice(COHORT_SIZE, Object.values(remainingAlbums).length);

      // Increase the counter
      i = i + COHORT_SIZE;

      // Make a GET request to the Imgur API's Album endpoint for each album ID
      await Promise.all(
        Object.values(albumsToFetch).map((album) => {
          return fetch(`https://api.imgur.com/3/album/${album}`, {
            headers: {
              Authorization: `Client-ID ${IMGUR_AUTHORIZATION}`,
            },
          });
        })
      )
        .then((results) => Promise.all(results.map((r) => r.json())))
        .then((responses) =>
          responses
            .filter((response) => (response ? response : null))
            .map((response) => ({
              albumId: response.data.id,
              cover: response.data.cover,
              title: response.data.title,
            }))
        )
        .then((results: any) => {
          const fetchedAlbums = albumCovers.concat(results);

          setAlbumCovers(fetchedAlbums);
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError: string) => {
                console.log("Json error from API");
                console.log(jsonError);
              })
              .catch(() => {
                console.log("Generic error from API");
                console.log(error.statusText);
              });
          } else {
            console.log("Fetch error");
            console.log(error);
          }
        });
    };
  }

  const numberOfPages = 0;

  return (
    <div>
      <PaginationContextProvider numberOfPages={numberOfPages}>
        <Menu /> 
        <AlbumSelector />
        <ThumbnailGallery albumCovers={albumCovers} />
      </PaginationContextProvider>
    </div>
  );
};
export default AlbumList;
