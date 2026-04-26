import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { resetPassword } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const showToast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      showToast('Password reset successfully. You can now login.', 'success');
      navigate('/login');
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
              background: 'rgba(16,185,129,0.1)', border: '1px solid var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, color: 'var(--green-primary)'
            }}>
              <i className="fa-solid fa-key"></i>
            </div>
            <h2 className="auth-title">Set New Password</h2>
            <p className="auth-subtitle">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock input-icon"></i>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-check-double input-icon"></i>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <> <i className="fa-solid fa-circle-notch fa-spin"></i> Resetting... </>
              ) : (
                <> <i className="fa-solid fa-rotate"></i> Reset Password </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="link" onClick={() => navigate('/login')}>Back to login</button>
          </p>
        </div>
      </div>
    </div>
  );
}
