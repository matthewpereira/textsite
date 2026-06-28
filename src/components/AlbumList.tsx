import { useAuth0 } from "@auth0/auth0-react";
import Menu from './Menu.tsx';
import AlbumSelector from "./AlbumSelector";

const AlbumList = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
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
