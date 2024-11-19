/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  if (!currentUser) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/" />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
