import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: 'fa-shield-halved',
      title: 'Zero-Knowledge Architecture',
      desc: 'Your encryption keys are derived from your master password and never leave your browser. We store your data, but we can never see it.'
    },
    {
      icon: 'fa-lock',
      title: 'Military-Grade Encryption',
      desc: 'All files are protected with 256-bit AES-GCM and RSA-4096 encryption, the highest standards in the industry today.'
    },
    {
      icon: 'fa-share-nodes',
      title: 'Secure Sharing Controls',
      desc: 'Share files with granular control. Set passwords, expiration dates, and track view history with end-to-end security.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="landing-bg-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="bg-mesh"></div>
      </div>

      {/* Modern Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="brand-logo" onClick={() => navigate('/')}>
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
            <button className="topbar-btn theme-toggle" onClick={toggleTheme}>
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Advanced End-to-End Encryption
          </div>
          <h1 className="hero-title">
            The World's Most <br /> <span>Private Cloud</span> Vault
          </h1>
          <p className="hero-subtitle">
            Securely store, share, and collaborate on your sensitive files with 
            Zero-Knowledge security. Your privacy isn't an option—it's standard.
          </p>
          <div className="hero-btns">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Your Secure Vault
              <i className="fa-solid fa-arrow-right" style={{ marginLeft: '10px' }}></i>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('security').scrollIntoView({ behavior: 'smooth' })}>
              Learn How It Works
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="security-card-visual">
            <div className="visual-header">
              <i className="fa-solid fa-lock"></i>
              <span>Encryption Status: Active</span>
            </div>
            <div className="visual-body">
              <div className="visual-line"></div>
              <div className="visual-line short"></div>
              <div className="visual-line"></div>
              <div className="visual-key">
                <i className="fa-solid fa-key"></i>
                <span>Private Key Derived</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Comparison</span>
            <h2 className="section-title">How we stack up</h2>
          </div>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th className="highlight">ZK Vault</th>
                  <th>Google Drive</th>
                  <th>Dropbox</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Zero-Knowledge Encryption</td>
                  <td className="highlight"><i className="fa-solid fa-check"></i></td>
                  <td><i className="fa-solid fa-xmark"></i></td>
                  <td><i className="fa-solid fa-xmark"></i></td>
                </tr>
                <tr>
                  <td>Client-Side Processing</td>
                  <td className="highlight"><i className="fa-solid fa-check"></i></td>
                  <td><i className="fa-solid fa-xmark"></i></td>
                  <td><i className="fa-solid fa-xmark"></i></td>
                </tr>
                <tr>
                  <td>Privacy by Design</td>
                  <td className="highlight"><i className="fa-solid fa-check"></i></td>
                  <td><i className="fa-solid fa-minus"></i></td>
                  <td><i className="fa-solid fa-minus"></i></td>
                </tr>
                <tr>
                  <td>End-to-End File Sharing</td>
                  <td className="highlight"><i className="fa-solid fa-check"></i></td>
                  <td><i className="fa-solid fa-check"></i></td>
                  <td><i className="fa-solid fa-check"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security Deep Dive */}
      <section id="security" className="security-section">
        <div className="container">
          <div className="security-grid">
            <div className="security-text">
              <span className="section-label">Trust & Technology</span>
              <h2 className="section-title">Security without compromise</h2>
              <p className="section-desc">
                We use industry-standard PBKDF2 for password derivation and 
                AES-256-GCM for file encryption. Unlike other providers, 
                your unencrypted data never touches our servers.
              </p>
              <div className="security-features">
                {features.map((f, i) => (
                  <div key={i} className="s-feature">
                    <div className="s-icon">
                      <i className={`fa-solid ${f.icon}`}></i>
                    </div>
                    <div className="s-content">
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="security-visual">
               <div className="lock-animation">
                  <i className="fa-solid fa-shield-check"></i>
                  <div className="radar-circle"></div>
                  <div className="radar-circle delay-1"></div>
                  <div className="radar-circle delay-2"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to secure your digital life?</h2>
          <p>Join thousands of users who trust ZK Vault for their most sensitive data.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Create Your Free Vault
          </button>
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="logo-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="brand-name">ZK Vault</span>
            </div>
            <p>Designed for absolute privacy and security.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <button onClick={() => navigate('/login')}>Sign In</button>
              <button onClick={() => navigate('/register')}>Sign Up</button>
              <button onClick={() => navigate('/contact')}>Support</button>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
              <button onClick={() => navigate('/terms')}>Terms of Service</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ZK Vault. Developed by <span className="highlight-text">Singh</span></p>
        </div>
      </footer>
    </div>
  );
}
