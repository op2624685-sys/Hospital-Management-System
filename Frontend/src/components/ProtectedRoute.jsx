import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, hasRole } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
