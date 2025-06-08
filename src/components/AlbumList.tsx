import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import Menu from './Menu.tsx';
import AlbumSelector from "./AlbumSelector";

const AlbumList = () => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [authChecked, setAuthChecked] = useState(false);

  // Give Auth0 a moment to settle
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while Auth0 is checking or we're waiting
  if (isLoading || !authChecked) {
    return (
      <div>
        <Menu />
        <div style={{ textAlign: "center", padding: "50px" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        <Menu />
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Please log in to view albums</h2>
          <button 
            onClick={() => loginWithRedirect({ 
              appState: { returnTo: '/albums' }
            })}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Log In
          </button>
        </div>
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
