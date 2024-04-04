import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!user) {
    return null;
  }

  if (isLoading && !isAuthenticated) {
    return <div>...</div>;
  }

  return (
    isAuthenticated && (
      <div className="profileWrapper">
        <p className="profile__email">{user.email}</p>
      </div>
    )
  );
};

export default Profile;
