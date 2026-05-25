import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
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
