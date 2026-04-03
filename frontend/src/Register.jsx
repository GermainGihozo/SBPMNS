import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

function Register() {
  const [userData, setUserData] = useState({ username: '', password: '', role: 'officer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!userData.username || !userData.password) {
      setError('Username and password are required');
      return;
    }
    if (userData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        alert('User registered successfully! Redirecting to login...');
        setUserData({ username: '', password: '', role: 'officer' });
        navigate('/login');
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🛂</span>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join SBPMNS today</p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Role</label>
            <div className="input-wrapper">
              <span className="input-icon">🎭</span>
              <select 
                name="role" 
                value={userData.role} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="admin">Admin</option>
                <option value="officer">Officer</option>
                <option value="health">Health Officer</option>
              </select>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login" className="auth-link">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
