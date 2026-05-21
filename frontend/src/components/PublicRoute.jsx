import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
    const access_token = localStorage.getItem("access_token");

    if (access_token) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default PublicRoute;