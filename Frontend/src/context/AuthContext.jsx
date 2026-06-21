import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authAPI, clearAuthTokens, getAccessToken, getRefreshToken, patientAPI, saveAuthTokens } from "../api/api";
import API from "../api/api";
import { queryClient } from "../lib/queryClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const oauthProcessingRef = useRef(false);

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
      if (isLoggedIn && user?.id && user?.roles?.includes("PATIENT")) {
        try {
          const response = await patientAPI.getProfileCompletionStatus();
          const isComp = response.data?.isComplete !== undefined ? response.data?.isComplete : response.data?.complete;
          setProfileComplete(isComp ?? false);
        } catch (error) {
          console.error("Error fetching profile completion status:", error);
        }
      }
    };

    fetchProfileCompletionStatus();
  }, [isLoggedIn, user?.id, rolesKey]);

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

  const login = useCallback((data) => {
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
  }, []);

  // Integrated OAuth Detection & Sync
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');

    if (token && !oauthProcessingRef.current) {
        oauthProcessingRef.current = true;
        saveAuthTokens({ token, refreshToken });

        const syncOAuthProfile = async () => {
            try {
                // Fetch profile using the newly saved token
                const response = await API.get('/auth/me');
                const userData = response.data;
                
                login({
                    token,
                    refreshToken,
                    userId: userData.userId,
                    username: userData.username || '',
                    email: userData.email || '',
                    profilePhoto: userData.profilePhoto || null,
                    roles: userData.roles || [],
                });

                toast.success('Login successful via OAuth');
                
                // Clean URL parameters
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);

                // Role-based redirection
                const userRoles = userData.roles || [];
                if (userRoles.includes('HEADADMIN')) {
                    navigate('/head-admin', { replace: true });
                } else if (userRoles.includes('ADMIN')) {
                    navigate('/admin', { replace: true });
                } else if (userRoles.includes('DOCTOR')) {
                    navigate('/doctor/booked-details', { replace: true });
                } else if (userRoles.includes('RECEPTIONIST')) {
                    navigate('/receptionist/appointments', { replace: true });
                } else if (userRoles.includes('PATIENT')) {
                    navigate('/my-appointments', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error("OAuth profile sync failed:", error);
                toast.error("Authentication failed during profile sync");
                navigate('/login', { replace: true });
            } finally {
                oauthProcessingRef.current = false;
            }
        };

        syncOAuthProfile();
    }
  }, [location.search, login, navigate]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }
    clearSession();
  }, [clearSession]);

  const updateUserProfile = useCallback((profileData) => {
    setUser((prev) => {
        const updatedUser = {
            ...prev,
            ...profileData,
        };
        
        // Update localStorage
        if (profileData.username) localStorage.setItem("username", profileData.username);
        if (profileData.email) localStorage.setItem("email", profileData.email);
        if (profileData.profilePhoto) {
            localStorage.setItem("profilePhoto", profileData.profilePhoto);
        } else if (Object.prototype.hasOwnProperty.call(profileData, "profilePhoto")) {
            localStorage.removeItem("profilePhoto");
        }
        
        return updatedUser;
    });
  }, []);

  const updateProfileCompletionStatus = useCallback((isComplete) => {
    setProfileComplete(isComplete);
  }, []);

  const hasRole = useCallback((role) => user?.roles?.includes(role), [user?.roles]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, hasRole, updateUserProfile, profileComplete, updateProfileCompletionStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
