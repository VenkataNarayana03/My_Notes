import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await adminApi.post('/admin/login', form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Admin login</h1>
          <p className="muted">Sign in to view registered users.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="alert">{error}</div>}
          <label>
            Admin email
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
            {loading ? 'Signing in...' : 'Admin login'}
          </button>
        </form>

        <p className="muted center">
          <Link to="/login">Back to user login</Link>
        </p>
      </section>
    </main>
  );
}
