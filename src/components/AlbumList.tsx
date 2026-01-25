import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import Menu from './Menu.tsx';
import AlbumSelector from "./AlbumSelector";

const AlbumList = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return (
      <div style={{ fontSize: "12px", padding: "8px" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Menu />
      <AlbumSelector />
    </div>
  );
};

export default AlbumList;
