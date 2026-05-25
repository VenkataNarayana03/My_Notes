import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Task Notes</p>
          <h1>Create account</h1>
          <p className="muted">Start keeping your work organized.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="alert">{error}</div>}
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="muted center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
