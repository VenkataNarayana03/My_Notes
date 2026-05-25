import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginMethod, setLoginMethod] = useState('password');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const completeLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/dashboard');
  };

  const chooseMethod = (method) => {
    setLoginMethod(method);
    setError('');
    setNotice('');
    setOtp('');
    setOtpSent(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);
      completeLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (event) => {
    event?.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/request-otp', { email: form.email });
      setOtpSent(true);
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send login code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp });
      completeLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify login code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Task Notes</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to manage your notes and tasks.</p>
        </div>

        <div className="auth-method-switch" role="tablist" aria-label="Login method">
          <button
            type="button"
            role="tab"
            className={loginMethod === 'password' ? 'auth-method-button active' : 'auth-method-button'}
            aria-selected={loginMethod === 'password'}
            onClick={() => chooseMethod('password')}
          >
            Password
          </button>
          <button
            type="button"
            role="tab"
            className={loginMethod === 'otp' ? 'auth-method-button active' : 'auth-method-button'}
            aria-selected={loginMethod === 'otp'}
            onClick={() => chooseMethod('otp')}
          >
            Email OTP
          </button>
        </div>

        {loginMethod === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="form">
          {error && <div className="alert">{error}</div>}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.3 0 9 7 9 7a15 15 0 01-3.2 3.8M6.2 6.2C4.2 7.8 3 12 3 12s3.7 7 9 7c.7 0 1.4-.1 2.1-.3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 12s3.7-7 9-7 9 7 9 7-3.7 7-9 7-9-7-9-7z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </span>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        ) : (
          <form onSubmit={otpSent ? verifyOtp : requestOtp} className="form">
            {error && <div className="alert">{error}</div>}
            {notice && <div className="notice">{notice}</div>}
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            {otpSent && (
              <label>
                Login code
                <input
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </label>
            )}
            <button type="submit" disabled={loading}>
              {loading ? 'Please wait...' : otpSent ? 'Verify and login' : 'Send login code'}
            </button>
            {otpSent && (
              <button type="button" className="text-button" onClick={requestOtp} disabled={loading}>
                Resend code
              </button>
            )}
          </form>
        )}

        <p className="muted center">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="muted center">
          Administrator? <Link to="/admin/login">Admin login</Link>
        </p>
      </section>
    </main>
  );
}
