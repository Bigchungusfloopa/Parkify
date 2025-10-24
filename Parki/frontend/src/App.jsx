import { Routes, Route, Navigate } from 'react-router-dom';
import Signp from './pages/Signp';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin'; // Add this
import Admin from './components/Admin';
import Dashboard from './pages/Dashboard';
import AuthLayout from './pages/AuthLayout';
import History from './pages/History';
import './App.css';
import './index.css';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<Signp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} /> {/* Add this */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Route>

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;