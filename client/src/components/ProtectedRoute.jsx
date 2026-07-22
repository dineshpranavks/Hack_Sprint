import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <div className="spinner" />
        <div className="loading-label">Verifying session...</div>
        <div className="typing-dots"><span /><span /><span /></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
