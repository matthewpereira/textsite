import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import styles from "./Profile.module.scss";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading && !isAuthenticated) {
    return <div>...</div>;
  }

  const displayTextWidth = (text, font) => {
    const canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    
    context.font = font;
    
    const metrics = context.measureText(text);
    
    return metrics.width;
  }
  
  const snipLastCharacter = string => string.substr(0, string.length - 1);
  
  const userLength = isAuthenticated ? displayTextWidth(snipLastCharacter(user.name), 'regular 8px Oxygen') : null;
  const emailLength = isAuthenticated ? displayTextWidth(snipLastCharacter(user.email), 'regular 8px Oxygen') : null;
  
  return (
    isAuthenticated && (
      <div>
        <div className={styles.profileWrapper}>
          <img src={user.picture} alt={user.name} />
          <p style={{ width: userLength + 'px' }} className={styles.username}>{user.name}</p>
          <p style={{ width: emailLength + 'px' }} className={styles.email}>{user.email}</p>
          <Link className={styles.albums} to={`/albums`}>
            Albums
          </Link>
          <LogoutButton />
        </div>
      </div>
    )
  );
};

export default Profile;
