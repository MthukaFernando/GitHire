import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}>
        <img src={logo} alt="GitHire logo" style={{ width: '38px', height: '39px', borderRadius: '8px' }} />
        <span style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#f8fafc',
          letterSpacing: '-0.5px',
        }}>
          Git<span style={{ color: '#a78bfa' }}>Hire</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <span className="nav-email" style={{
          fontSize: '14px',
          color: '#94a3b8',
        }}>
          {user?.email}
        </span>
        <button className="btn-ghost" onClick={handleLogout} style={{
          padding: '8px 16px',
          fontSize: '13px',
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;