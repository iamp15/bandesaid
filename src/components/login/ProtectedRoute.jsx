/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingSpinner from "../LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!currentUser) {
    // Redirect to login page if user is not authenticated
    console.log("Redirecting to login page because of protected route");
    return <Navigate to="/" />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
