import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 16px',
          }}>
            ⚡
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#f8fafc',
            letterSpacing: '-0.5px',
          }}>
            Git<span style={{ color: '#a78bfa' }}>Hire</span>
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '8px',
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#fca5a5',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#94a3b8',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#94a3b8',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '14px',
            color: '#94a3b8',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#a78bfa',
              textDecoration: 'none',
              fontWeight: '500',
            }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;