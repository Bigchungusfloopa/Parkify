import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
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
            } else {
                throw new Error("Login successful, but user ID was missing.");
            }

            // Role check removed, always navigate to dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="logo-text">Parkify</h1>
            <form className="auth-form" onSubmit={handleLogin}>
                <h2>Welcome Back!</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="input-group">
                    <label htmlFor="email">Email</label>
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
                {/* Admin checkbox removed */}
                <button type="submit" className="auth-button">Login</button>
                <div className="auth-link">
                    <span>Don't have an account? </span>
                    <Link to="/signup">Sign Up</Link>
                </div>
            </form>
        </div>
    );
}