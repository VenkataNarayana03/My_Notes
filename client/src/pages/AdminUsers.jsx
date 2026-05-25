import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi.js';

const formatRegisteredDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await adminApi.get('/admin/users');
        setUsers(data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
          navigate('/admin/login');
          return;
        }

        setError(err.response?.data?.message || 'Could not load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name} (${user.email}) and all of this user's tasks?`);

    if (!confirmed) {
      return;
    }

    setError('');
    setDeletingId(user._id);

    try {
      await adminApi.delete(`/admin/users/${user._id}`);
      setUsers((currentUsers) => currentUsers.filter((item) => item._id !== user._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <main className="app-page">
      <nav className="navbar">
        <div>
          <strong>Task Notes Admin</strong>
          {admin.email && <span>{admin.email}</span>}
        </div>
        <button type="button" className="secondary" onClick={logout}>
          Logout
        </button>
      </nav>

      <section className="admin-users">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>Registered users</h1>
          </div>
          <span className="task-count">{users.length} users</span>
        </div>

        <section className="task-table-panel">
          {error && <div className="alert">{error}</div>}
          {loading ? (
            <p className="muted">Loading users...</p>
          ) : users.length ? (
            <div className="task-table-wrap">
              <table className="task-table admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Name">
                        <span>{user.name}</span>
                      </td>
                      <td data-label="Email">
                        <span>{user.email}</span>
                      </td>
                      <td data-label="Registered">
                        <span>{formatRegisteredDate(user.createdAt)}</span>
                      </td>
                      <td data-label="Actions">
                        <button
                          type="button"
                          className="danger"
                          disabled={deletingId === user._id}
                          onClick={() => deleteUser(user)}
                        >
                          {deletingId === user._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">No registered users found.</p>
          )}
        </section>
      </section>
    </main>
  );
}
