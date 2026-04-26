import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../Landing.css';

export default function TermsOfService() {
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
              <button className="nav-btn" onClick={() => window.history.back()} title="Go Back">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="nav-btn" onClick={() => window.history.forward()} title="Go Forward">
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
          <span className="section-label">Legal Framework</span>
          <h1 className="section-title">Terms of Service</h1>
          <p className="text-muted">Last Updated: April 2024</p>
        </div>

        <div className="policy-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using ZK Vault, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the service.
          </p>

          <h2>2. User Responsibility</h2>
          <p>
            Since we use Zero-Knowledge encryption, <strong>if you lose your Master Password, 
            we cannot recover your data.</strong> You are solely responsible for maintaining 
            the security of your account credentials.
          </p>

          <h2>3. Permitted Use</h2>
          <p>
            You agree not to use ZK Vault for any illegal activities, including but not limited to 
            storing or distributing malicious software, copyrighted material without permission, 
            or any content that violates international laws.
          </p>

          <h2>4. Service Availability</h2>
          <p>
            While we strive for 99.9% uptime, ZK Vault is provided "as is" without any warranties. 
            We are not liable for any data loss resulting from server outages, though our 
            distributed storage minimizes this risk.
          </p>

          <h2>5. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms. 
            Users may terminate their own accounts at any time, which will result in the 
            permanent deletion of all hosted encrypted data.
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
