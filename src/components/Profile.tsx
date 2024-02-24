import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!user) {
    return null;
  }
  
  if (isLoading && !isAuthenticated) {
    return <div>...</div>;
  }

  // const displayTextWidth = (text: string, font: string): number => {
  //   const canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
  //   const context = canvas.getContext("2d");
    
  //   context.font = font;
    
  //   const metrics = context.measureText(text);
    
  //   return metrics.width;
  // }
  
  // const snipLastCharacter = (string: string) => string.substr(0, string.length - 1);
  
  // const userLength = isAuthenticated ? displayTextWidth(snipLastCharacter(user.name), 'regular 8px Oxygen') : null;
  // const emailLength = isAuthenticated ? displayTextWidth(snipLastCharacter(user.email), 'regular 8px Oxygen') : null;

  const userLength = 16;
  const emailLength = 16;
  
  return (
    isAuthenticated && (
      <div>
        <div className="profileWrapper">
          <img src={user.picture} alt={user.name} />
          <p style={{ width: userLength + 'px' }} className="profile__username">{user.name}</p>
          <p style={{ width: emailLength + 'px' }} className="profile__email">{user.email}</p>
        </div>
      </div>
    )
  );
};

export default Profile;
