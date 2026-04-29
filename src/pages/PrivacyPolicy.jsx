import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../Landing.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className="brand-name">ZK Vault</span>
          </div>

          <div className="nav-actions">
            <div className="topbar-nav-controls">
              <button className="nav-btn" onClick={() => navigate(-1)} title="Go Back">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="nav-btn" onClick={() => navigate(1)} title="Go Forward">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            <button 
              className="topbar-btn" 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ border: 'none', background: 'var(--bg-elevated)' }}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Enter Vault</button>
          </div>
        </div>
      </nav>

      <div className="policy-page">
        <div className="policy-header">
          <span className="section-label">Trust & Security</span>
          <h1 className="section-title">Privacy Policy</h1>
          <p className="text-muted">Last Updated: April 2024</p>
        </div>

        <div className="policy-content">
          <h2>1. Zero-Knowledge Architecture</h2>
          <p>
            At ZK Vault, we operate on a "Zero-Knowledge" principle. This means your data is encrypted 
            on your device before it is sent to our servers. We do not have the keys to decrypt your files, 
            and we cannot access your content under any circumstances.
          </p>

          <h2>2. Data Collection</h2>
          <p>
            We collect minimal information required to maintain your account: your email address and 
            an encrypted version of your master password (which we cannot decrypt). We do not track 
            your file contents, filenames, or sharing habits.
          </p>

          <h2>3. Encryption Standards</h2>
          <p>
            All files are protected using 256-bit AES-GCM encryption. Key exchange is handled via RSA 
            public-private key pairs. Your private key is stored in an encrypted format that can only 
            be unlocked with your Master Password, which never leaves your browser.
          </p>

          <h2>4. Third-Party Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information 
            to outside parties. Since we cannot access your files, we cannot share them even if 
            requested by legal authorities.
          </p>

          <h2>5. Your Control</h2>
          <p>
            You have full control over your data. You can delete your account and all associated 
            encrypted files at any time through the Settings panel in your dashboard.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
