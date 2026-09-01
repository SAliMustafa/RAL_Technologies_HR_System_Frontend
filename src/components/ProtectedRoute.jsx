import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const {loading, user} = useAuth()


    if(loading) return <p>Loading...</p>

    if (!user) {
        return <Navigate to="/sign-in" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}


export default ProtectedRoute;
