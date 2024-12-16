import { Navigate } from "react-router-dom";

import { AuthContext } from "./components/context/Auth";
import { useContext } from "react";

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'user') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
