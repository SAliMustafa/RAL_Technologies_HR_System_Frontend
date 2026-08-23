import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const {loading, user} = useAuth()


    if(loading) return <p>Loading...</p>

    if (!user) {
        return <Navigate to="/sign-in" />;
    }


    return children;
}


export default ProtectedRoute;