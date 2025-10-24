import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Login failed');
            }

            const data = await response.json();
            sessionStorage.setItem('userName', data.name);
            const userId = data.userId || data.id;
            if (userId) {
                sessionStorage.setItem('userId', userId.toString());
            }

            // Always redirect to admin panel for admin login
            navigate('/admin');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="logo-text">Parkify</h1>
            <form className="auth-form" onSubmit={handleAdminLogin}>
                <h2>Admin Login</h2>
                {error && <p className="error-message">{error}</p>}
                
                <div className="input-group">
                    <label htmlFor="email">Admin Email</label>
                    <input
                        type="email" id="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password" id="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    />
                </div>

                <button type="submit" className="auth-button admin-login-btn">
                    Login as Admin
                </button>
                
                <div className="auth-link">
                    <span>Regular user? </span>
                    <Link to="/login">User Login</Link>
                </div>
            </form>
        </div>
    );
}