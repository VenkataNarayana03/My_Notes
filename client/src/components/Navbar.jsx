import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <strong>Task Notes</strong>
        {user.name && <span>{user.name}</span>}
      </div>
      <button type="button" className="secondary" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
