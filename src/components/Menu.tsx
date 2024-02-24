import { useAuth0 } from "@auth0/auth0-react";
import Pagination from "./Pagination.tsx";
import Profile from "./Profile.tsx";
import Shortcuts from "./Shortcuts.tsx";

const Menu = (loadedImages: any) => {

  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const Login = () => <span><a className="loginButton" onClick={() => loginWithRedirect()}>Login</a></span>;

  const Logout = () => <span><a onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</a></span>;

 return (
    <nav>
      <div className="nav-left">
        <span className="homeLink"><a href="/">Matthew Pereira</a></span>
        <span><a href="/about">About</a></span>
        {isAuthenticated ? <span><a href="/albums">Albums</a></span> : null}
        <span><a href="mailto:mail@matthewpereira.com">Email</a></span>
        <Shortcuts />
      </div>
      <div className="nav-right">
        <Pagination loadedImages={loadedImages} />
        {!isAuthenticated ? <Login /> : null}
        {isAuthenticated ? <Profile /> : null}
        {isAuthenticated ? <Logout /> : null}
      </div>
    </nav>
  )
}
export default Menu;