import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "../css/auth.css";

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // login | register
  const [loginMethod, setLoginMethod] = useState('email'); // email | phone
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const { login, register, requestOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login({ email: form.email, password: form.password }, 'email');
      if (data.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await requestOtp(form.phone);
      setOtpRequested(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ phone: form.phone, otp: form.otp }, 'phone');
      if (data.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleGoogleLogin = async () => {
    // A simple Google One Tap integration is possible here.
    // For brevity, assume you collect idToken from Google and call:
    // await login({ idToken }, 'google');
    alert('Integrate Google login here using Google Identity Services.');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <div className="auth-method-toggle">
              <button
                className={loginMethod === 'email' ? 'active' : ''}
                onClick={() => setLoginMethod('email')}
              >
                Email
              </button>
              <button
                className={loginMethod === 'phone' ? 'active' : ''}
                onClick={() => setLoginMethod('phone')}
              >
                Phone OTP
              </button>
            </div>

            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="auth-form">
                <div className="form-row">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button className="btn-primary wide" type="submit">
                  Login
                </button>
              </form>
            )}

            {loginMethod === 'phone' && (
              <div className="auth-form">
                <div className="form-row">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                {!otpRequested ? (
                  <>
                    {error && <div className="error-message">{error}</div>}
                    <button
                      className="btn-primary wide"
                      onClick={handleRequestOtp}
                    >
                      Request OTP
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <label>OTP</label>
                      <input
                        name="otp"
                        value={form.otp}
                        onChange={handleChange}
                      />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button
                      className="btn-primary wide"
                      onClick={handlePhoneLogin}
                    >
                      Verify & Login
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="auth-divider">OR</div>
            <button
              className="btn-google"
              type="button"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </button>
          </>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-row">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn-primary wide" type="submit">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
