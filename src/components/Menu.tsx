import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Pagination from "./Pagination.tsx";
import Profile from "./Profile.tsx";
import Shortcuts from "./Shortcuts.tsx";

const Menu = (loadedImages: any) => {

  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const handleLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
    loginWithRedirect();
    event.preventDefault();
  }

  const Login = () => <span><a className="loginButton" href="#" onClick={handleLogin}>Login</a></span>;

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    logout({ logoutParams: { returnTo: window.location.origin } });
    event.preventDefault();
  }

  const Logout = () => <span><a className="logoutButton" href="#" onClick={handleLogout}>Logout</a></span>;

  // Check if there are images to display
  const hasImages = loadedImages?.loadedImages && loadedImages.loadedImages.length > 0;

  return (
    <nav>
      <div className="nav-left">
        <span className="homeLink"><a href="/">Matthew Pereira</a></span>
        <span><Link to={ "/about" }>About</Link></span>
        {isAuthenticated ? <span><Link to="/albums">Albums</Link></span> : null}
        <span><a href="mailto:mail@matthewpereira.com">Email</a></span>
        {hasImages ? <Shortcuts /> : null}
      </div>
      <div className="nav-right">
        {hasImages ? <Pagination loadedImages={loadedImages} /> : null}
        {!isAuthenticated ? <Login /> : null}
        {isAuthenticated ? <div className="profile-desktop-only"><Profile /></div> : null}
        {isAuthenticated ? <Logout /> : null}
      </div>
    </nav>
  )
}
export default Menu;