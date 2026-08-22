import { Navigate, useLocation } from "react-router-dom";

import {
  roleHome,
  useAuth,
} from "../../context/auth";

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        Verifying secure session…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
