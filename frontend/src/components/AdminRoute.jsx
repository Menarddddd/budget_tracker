import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
    const access_token = localStorage.getItem("access_token");
    const is_admin = localStorage.getItem("is_admin");

    if (!access_token || is_admin !== "true") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

export default AdminRoute;