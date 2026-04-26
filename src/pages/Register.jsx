import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { register } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [showPass, setShowPass] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState({ width: '0%', color: 'transparent', label: 'Enter a password to see strength' });

  function updateStrength(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { width: '0%', color: 'transparent', label: 'Enter a password to see strength' },
      { width: '20%', color: '#ef4444', label: 'Very Weak' },
      { width: '40%', color: '#f97316', label: 'Weak' },
      { width: '60%', color: '#f59e0b', label: 'Fair' },
      { width: '80%', color: '#10b981', label: 'Strong' },
      { width: '100%', color: '#06d6a0', label: '✓ Very Strong — vault-grade password' },
    ];
    const l = levels[Math.min(score, 5)];
    setStrength(val ? l : levels[0]);
    setPassword(val);
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !email || !password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    try {
      showToast('Generating RSA Security Keys... This may take a moment.', 'info');
      
      // 1. Generate RSA Key Pair
      const { generateRSAKeyPair, deriveMasterKey, encryptStringAES } = await import('../utils/crypto');
      const { publicKeyBase64, privateKeyBase64 } = await generateRSAKeyPair();
      
      // 2. Derive Master Key from password
      const masterKey = await deriveMasterKey(password);
      
      // 3. Encrypt Private Key
      const { encryptedBase64, ivBase64 } = await encryptStringAES(privateKeyBase64, masterKey);
      const finalEncryptedPrivateKey = `${ivBase64}:${encryptedBase64}`;

      const username = `${firstName} ${lastName}`.trim();
      
      // 4. Register
      const data = await register(username, email, password, 'user', publicKeyBase64, finalEncryptedPrivateKey);
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      sessionStorage.setItem('zk_master_password', password);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      if (error.message.includes('already exists')) {
        showToast('An account with this email already exists. Try logging in or resetting your password.', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 500 }}>
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
          <h2 className="auth-title">Create your vault</h2>
          <p className="auth-subtitle">Your files, your keys — always.</p>

          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group mb-0">
                <label className="form-label">First Name</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-user input-icon"></i>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Last Name</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-user input-icon"></i>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 18 }}>
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email" 
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => updateStrength(e.target.value)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(v => !v)}>
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: strength.width, background: strength.color }}></div>
              </div>
              <p className="form-hint" style={{ color: strength.color }}>{strength.label}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-key input-icon"></i>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Re-enter your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="alert info mb-16">
              <i className="fa-solid fa-circle-info"></i>
              <span><strong>Zero Knowledge:</strong> Your master password is never stored or transmitted. We cannot recover it.</span>
            </div>

            <label className="check-row" style={{ marginBottom: 20 }}>
              <input type="checkbox" required />
              I agree to the{' '}
              <button type="button" className="link" style={{ marginLeft: 4 }}>Terms of Service</button>{' '}
              &{' '}
              <button type="button" className="link" style={{ marginLeft: 4 }}>Privacy Policy</button>
            </label>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              <i className="fa-solid fa-vault"></i> {loading ? 'Creating...' : 'Create Encrypted Vault'}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
            Already have an account?{' '}
            <button className="link" onClick={() => navigate('/login')}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
