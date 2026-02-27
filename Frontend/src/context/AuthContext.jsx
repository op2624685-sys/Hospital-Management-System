import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("token") !== null
  );

  const [user, setUser] = useState(() => ({
    id: localStorage.getItem("userId"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  }));

  const login = (data) => {
    setIsLoggedIn(true);
    setUser({
      id: data.userId,
      roles: data.roles || [],
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;