import { Navigate } from "react-router-dom";

function RoleRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;
