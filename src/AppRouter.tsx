import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DefaultView from './views/DefaultView.tsx';
import AlbumView from './views/AlbumView.tsx';
import AboutView from './views/AboutView.tsx';
import AlbumList from './components/AlbumList.tsx';
import detectLocal from './helpers/detectLocal.ts';

const WrapperComponent = () => {
  const param = new URL(document.location.toString()).searchParams.toString();
  const albumId = param.substring(0, param.length - 1);

  if (albumId !== null) {
    return <AlbumView albumId={albumId} />;
  }

  return <DefaultView />;
};

const basename = detectLocal() ? '/' : '/textsite/';

const AppRouter = () => (
  <Router basename={basename}>
    <Routes>
      <Route path="/" element={<WrapperComponent />} />
      <Route path="/albums" element={<AlbumList />} />
      <Route path="/about" element={<AboutView />} />
    </Routes>
  </Router>
);

export default AppRouter;
