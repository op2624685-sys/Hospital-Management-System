import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("token") !== null
  );

  const [user, setUser] = useState(() => ({
    id: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    profilePhoto: localStorage.getItem("profilePhoto"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  }));

  const [profileComplete, setProfileComplete] = useState(true);

  // Fetch profile completion status on login
  useEffect(() => {
    const fetchProfileCompletionStatus = async () => {
      if (isLoggedIn && user?.id && user?.roles?.includes("PATIENT")) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/patients/profile/completion-status`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setProfileComplete(data.isComplete);
          }
        } catch (error) {
          console.error("Error fetching profile completion status:", error);
        }
      }
    };

    fetchProfileCompletionStatus();
  }, [isLoggedIn, user?.id, user?.roles?.join("|")]);

  const login = (data) => {
    setIsLoggedIn(true);
    const userData = {
      id: data.userId,
      username: data.username || '',
      email: data.email || '',
      profilePhoto: data.profilePhoto || null,
      roles: data.roles || [],
    };
    setUser(userData);
    
    // Store in localStorage for persistence
    localStorage.setItem("username", userData.username);
    localStorage.setItem("email", userData.email);
    if (userData.profilePhoto) {
      localStorage.setItem("profilePhoto", userData.profilePhoto);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setProfileComplete(true);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("profilePhoto");
  };

  const updateUserProfile = (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
    };
    setUser(updatedUser);
    
    // Update localStorage
    if (profileData.username) localStorage.setItem("username", profileData.username);
    if (profileData.email) localStorage.setItem("email", profileData.email);
    if (profileData.profilePhoto) localStorage.setItem("profilePhoto", profileData.profilePhoto);
  };

  const updateProfileCompletionStatus = (isComplete) => {
    setProfileComplete(isComplete);
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, hasRole, updateUserProfile, profileComplete, updateProfileCompletionStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
