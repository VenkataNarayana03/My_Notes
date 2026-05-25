import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const isAuthenticated = () => Boolean(localStorage.getItem('token'));

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AdminProtectedRoute({ children }) {
  return localStorage.getItem('adminToken') ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
