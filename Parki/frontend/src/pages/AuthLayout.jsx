import { Outlet } from 'react-router-dom';
import Aurora from '../components/Aurora'; // Import Aurora instead

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="background">
        <Aurora /> {/* Use the new Aurora component */}
      </div>
      <Outlet />
    </div>
  );
}