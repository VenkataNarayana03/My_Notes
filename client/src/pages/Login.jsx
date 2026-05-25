import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
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
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="alert">{error}</div>}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

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
