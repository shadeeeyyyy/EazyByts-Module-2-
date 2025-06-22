import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Shared CSS for auth pages

const LoginPage = ({ login }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true);

        try {
            const response = await fetch('/api/users/login', { // Using proxy
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // If login successful, update auth context and navigate
            login(data.user, data.token); // Call context login function
            navigate('/dashboard'); // Redirect to dashboard
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-form-card">
                <h2>Login to StockPulse</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                <p className="auth-link-text">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;