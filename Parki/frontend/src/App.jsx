import { Routes, Route, Navigate } from 'react-router-dom';
import Signp from './pages/Signp';
import Login from './pages/Login';
// Remove AdminLogin import
import Admin from './components/Admin';
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from './pages/ResetPassword.jsx';
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
        {/* Remove AdminLogin route */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;