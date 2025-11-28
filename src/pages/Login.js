import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaMoneyCheckAlt, FaShieldAlt, FaUsers } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>?]).{6,}$/;

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!emailRegex.test(email)) {
    const msg = 'Please enter a valid email address.';
    setError(msg);
    alert(msg);
    return;
  }

  if (!passwordRegex.test(password)) {
    const msg = 'Password must be at least 6 characters long and contain an uppercase letter, number, and special character.';
    setError(msg);
    alert(msg);
    return;
  }

  try {
    const data = await login({ email, password });
    setUser(data);
    navigate(data.role === 'admin' ? '/admin' : '/dashboard');
  } catch {
    const msg = 'Login failed. Please check your credentials.';
    setError(msg);
    alert(msg);
  }
};


  return (
    <div className="login-wrapper-premium">
      <div className="login-card-premium">
        
        {/* Info Section */}
        <div className="login-info-panel">
          <h1>EGS Chit Fund</h1>
          <p>Smart savings. Easy borrowing.</p>
          <ul>
            <li><FaMoneyCheckAlt /> Flexible schemes tailored for you</li>
            <li><FaShieldAlt /> Secure financial transactions</li>
            <li><FaUsers /> Trusted by thousands</li>
            <li><FaCheckCircle /> 100% transparency</li>
          </ul>
        </div>

        {/* Login Form */}
        <div className="login-form-panel">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Login to your account</p>

          {error && <div className="login-error-premium">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form-fields">
            
           <table className="login-form-table">
  <tbody>
    {/* Email Field */}
    <tr>
      <td>
        <label htmlFor="email-input">Email</label>
      </td>
      <td>
        <div className="input-container">
          <input
            id="email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
      </td>
    </tr>

    {/* Password Field */}
    <tr>
      <td>
        <label htmlFor="password-input">Password</label>
      </td>
      <td>
        <div className="input-container">
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

            {/* Submit */}
            <button className="auth-btn sign-in-btn">Login</button>
          </form>

          <p className="register-text">
            Don’t have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
