import { Routes, Route, Navigate } from 'react-router-dom';
import Signp from './pages/Signp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthLayout from './pages/AuthLayout';
import History from './pages/History'; // Keep History
import './App.css';
import './index.css';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<Signp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Default to login */}
      </Route>

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} /> {/* Keep History route */}
      {/* Admin routes removed */}
    </Routes>
  );
}

export default App;