import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { forgotPassword } from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email', 'error');

    setLoading(true);
    try {
      await forgotPassword(email);
      showToast('Recovery link sent to your email', 'success');
      setEmail('');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="topbar-nav-controls" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1100 }}>
            <button className="nav-btn" onClick={() => window.history.back()} title="Go Back">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="nav-btn" onClick={() => window.history.forward()} title="Go Forward">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <div className="brand-logo">
            <div className="logo-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className="brand-name">ZK Vault</span>
          </div>
        </div>

        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(59,130,246,0.1)', border: '1px solid var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, color: 'var(--blue-primary)'
            }}>
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-subtitle">We'll send a recovery link to your email address</p>
          </div>

          <div className="alert warning mb-16">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Due to zero-knowledge architecture, you must have set up a recovery key to reset your master password.</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <> <i className="fa-solid fa-circle-notch fa-spin"></i> Sending... </>
              ) : (
                <> <i className="fa-solid fa-paper-plane"></i> Send Recovery Link </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="link" onClick={() => navigate('/login')}>← Back to login</button>
          </p>
        </div>
      </div>
    </div>
  );
}
