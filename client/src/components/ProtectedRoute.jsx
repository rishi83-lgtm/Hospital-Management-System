import { useAuth } from '../hooks/useAuth.js';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) {
    return <p className="m-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Please sign in to view this page.</p>;
  }
  if (roles.length && !roles.includes(user.role)) {
    return <p className="m-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">You do not have access to this page.</p>;
  }
  return children;
}