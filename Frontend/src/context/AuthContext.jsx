import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, clearAuthTokens, getAccessToken, getRefreshToken, patientAPI, saveAuthTokens } from "../api/api";
import { queryClient } from "../lib/queryClient";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => getAccessToken() !== null
  );

  const [user, setUser] = useState(() => ({
    id: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    profilePhoto: localStorage.getItem("profilePhoto"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  }));

  const [profileComplete, setProfileComplete] = useState(true);
  const rolesKey = (user?.roles || []).join("|");

  // Fetch profile completion status on login
  useEffect(() => {
    const fetchProfileCompletionStatus = async () => {
      if (location.pathname === "/profile") return;
      if (isLoggedIn && user?.id && user?.roles?.includes("PATIENT")) {
        try {
          const response = await patientAPI.getProfileCompletionStatus();
          setProfileComplete(response.data.isComplete);
        } catch (error) {
          console.error("Error fetching profile completion status:", error);
        }
      }
    };

    fetchProfileCompletionStatus();
  }, [isLoggedIn, user?.id, user?.roles, rolesKey, location.pathname]);

  const clearSession = useCallback(() => {
    queryClient.clear();
    setIsLoggedIn(false);
    setUser(null);
    setProfileComplete(true);
    clearAuthTokens();
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("profilePhoto");
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearSession();
    };

    window.addEventListener("hms:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("hms:auth-expired", handleAuthExpired);
  }, [clearSession]);

  const login = (data) => {
    // Prevent cross-account stale query data after account switches.
    queryClient.clear();
    saveAuthTokens({
      token: data.token,
      refreshToken: data.refreshToken,
    });
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
    localStorage.setItem("userId", userData.id ?? "");
    localStorage.setItem("roles", JSON.stringify(userData.roles || []));
    localStorage.setItem("username", userData.username);
    localStorage.setItem("email", userData.email);
    if (userData.profilePhoto) {
      localStorage.setItem("profilePhoto", userData.profilePhoto);
    } else {
      localStorage.removeItem("profilePhoto");
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }
    clearSession();
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
    if (profileData.profilePhoto) {
      localStorage.setItem("profilePhoto", profileData.profilePhoto);
    } else if (Object.prototype.hasOwnProperty.call(profileData, "profilePhoto")) {
      localStorage.removeItem("profilePhoto");
    }
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
