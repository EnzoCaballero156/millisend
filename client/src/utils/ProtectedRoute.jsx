import { Navigate, Outlet } from "react-router-dom"
import './ProtectedRoute.css'

const ProtectedRoute = ({ roomLoading = false, permiso, redirect }) => {
    if (roomLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        )
    }
    return permiso ? <Outlet /> : <Navigate to={redirect} replace />
}

export default ProtectedRoute