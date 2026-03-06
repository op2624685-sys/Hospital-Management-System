import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, roles }) => {
  const { isLoggedIn, hasRole } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;
  if (roles && !roles.some((r) => hasRole(r))) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
