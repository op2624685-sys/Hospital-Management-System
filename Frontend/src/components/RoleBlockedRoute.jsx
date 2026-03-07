import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBlockedRoute = ({ children, blockedRoles = [] }) => {
  const { isLoggedIn, hasRole } = useAuth();

  if (!isLoggedIn) return children;

  const isBlocked = blockedRoles.some((role) => hasRole(role));
  if (!isBlocked) return children;

  if (hasRole("HEADADMIN")) return <Navigate to="/head-admin" replace />;
  if (hasRole("ADMIN")) return <Navigate to="/admin" replace />;
  if (hasRole("DOCTOR")) return <Navigate to="/doctor/booked-details" replace />;

  return <Navigate to="/" replace />;
};

export default RoleBlockedRoute;
