import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { login } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      let data = await login(email, password);
      
      // Auto-upgrade older accounts with PKI Keys
      if (!data.encryptedPrivateKey) {
        showToast('Upgrading your account security... Please wait.', 'info');
        const { generateRSAKeyPair, deriveMasterKey, encryptStringAES } = await import('../utils/crypto');
        const { updateProfile } = await import('../utils/api');
        
        const { publicKeyBase64, privateKeyBase64 } = await generateRSAKeyPair();
        const masterKey = await deriveMasterKey(password);
        const { encryptedBase64, ivBase64 } = await encryptStringAES(privateKeyBase64, masterKey);
        const finalEncryptedPrivateKey = `${ivBase64}:${encryptedBase64}`;
        
        // Push the new keys to the server
        data = await updateProfile(data.username, data.email, data.token, publicKeyBase64, finalEncryptedPrivateKey);
        // We must re-add token since updateProfile doesn't return it
        data.token = JSON.parse(localStorage.getItem('userInfo'))?.token || await login(email, password).then(d=>d.token);
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      // Save password in session for ZK key derivation
      sessionStorage.setItem('zk_master_password', password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
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
          <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className="brand-name">ZK Vault</span>
          </div>
          <div className="topbar-nav-controls" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1100 }}>
            <button className="nav-btn" onClick={() => window.history.back()} title="Go Back">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="nav-btn" onClick={() => window.history.forward()} title="Go Forward">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <p className="auth-tagline">Zero Knowledge · End-to-End Encrypted</p>
        </div>

        <div className="auth-card">
          <div className="security-badge">
            <i className="fa-solid fa-lock"></i>
            <span>256-bit AES-GCM encryption · Your keys never leave your device</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to access your encrypted vault</p>

          <form onSubmit={handleLogin}>
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
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Master Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-key input-icon"></i>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(v => !v)}>
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-footer">
              <label className="check-row">
                <input type="checkbox" defaultChecked /> Remember this device
              </label>
              <button type="button" className="link" onClick={() => navigate('/forgot')}>Forgot password?</button>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              <i className="fa-solid fa-lock-open"></i> {loading ? 'Unlocking...' : 'Unlock Vault'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button 
            className="btn btn-secondary btn-full" 
            onClick={() => showToast('Zero-Knowledge Security Notice: Google Sign-in is disabled because we require a Master Password for client-side encryption that Google does not provide.', 'info')}
          >
            <i className="fa-brands fa-google"></i> Continue with Google
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
            Don't have an account?{' '}
            <button className="link" onClick={() => navigate('/register')}>Create one free</button>
          </p>
        </div>
      </div>
    </div>
  );
}
