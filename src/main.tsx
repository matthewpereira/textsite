import React              from 'react'
import ReactDOM           from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import DefaultView        from './views/DefaultView.tsx';
import AlbumView          from './views/AlbumView.tsx';

import './index.css'

const router = createBrowserRouter([
  // {
  //   path: "/albums",
  //   element: AlbumsView,
  // },
  {
    path: "/:albumId",
    element: <AlbumView />,
  },
  {
    path: "/",
    element: <DefaultView />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
