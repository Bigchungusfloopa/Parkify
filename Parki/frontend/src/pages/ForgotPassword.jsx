import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to send reset email');
            }

            const result = await response.text();
            setMessage('Password reset instructions have been sent to your email.');
            console.log('Reset token:', result); // For testing
            
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
                <h2>Reset Your Password</h2>
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}
                
                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
                
                <div className="auth-link">
                    <span>Remember your password? </span>
                    <Link to="/login">Back to Login</Link>
                </div>
            </form>
        </div>
    );
}