import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DefaultView from './views/DefaultView.tsx';
import AlbumView from './views/AlbumView.tsx';
import AboutView from './views/AboutView.tsx';
import AlbumList from './components/AlbumList.tsx';

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
  }
], { basename: '/' });

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter;

