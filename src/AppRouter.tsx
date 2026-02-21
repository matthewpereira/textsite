import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DefaultView from './views/DefaultView.tsx';
import AlbumView from './views/AlbumView.tsx';
import AboutView from './views/AboutView.tsx';
import AlbumList from './components/AlbumList.tsx';
import PlaygroundView from './views/PlaygroundView.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultView />,
  },
  {
    path: "/a/:albumId",
    element: <AlbumView />,
  },
  {
    path: "/albums",
    element: <AlbumList />,
  },
  {
    path: "/about",
    element: <AboutView />,
  },
  {
    path: "/playground",
    element: <PlaygroundView />,
  },
], { basename: '/' });

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter;

