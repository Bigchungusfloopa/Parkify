import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid reset link');
            return;
        }

        setIsLoading(true);

        try {
            // For simulation, we need to get email from user input or token
            // In real app, you'd decode the token to get email
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                    email: 'user@example.com' // In real app, get from token
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to reset password');
            }

            setMessage('Password has been reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="logo-text">Parkify</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Set New Password</h2>
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}
                
                <div className="input-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength="8"
                    />
                    <small>Password must be at least 8 characters with uppercase, lowercase, and number</small>
                </div>

                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <div className="auth-link">
                    <span>Back to </span>
                    <Link to="/login">Login</Link>
                </div>
            </form>
        </div>
    );
}