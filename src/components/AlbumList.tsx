import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Menu from './Menu.tsx';
import AlbumSelector from "./AlbumSelector";

const AlbumList = () => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: '/albums' } });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ fontSize: "12px", padding: "8px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Menu />
      <AlbumSelector />
    </div>
  );
};

export default AlbumList;
