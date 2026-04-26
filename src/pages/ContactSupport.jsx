import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { sendContactMessage } from '../utils/api';
import '../Landing.css';

export default function ContactSupport() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendContactMessage(name, email, subject, message);
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          <span className="section-label">Get in Touch</span>
          <h1 className="section-title">Contact Support</h1>
          <p className="text-muted">We're here to help you with any security or technical queries.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="contact-details">
              <h3>Email Us</h3>
              <p>Direct support from our lead engineer.</p>
              <a href="mailto:singhashwani9939@gmail.com" className="link" style={{ fontSize: '15px', marginTop: '5px', display: 'inline-block' }}>
                singhashwani9939@gmail.com
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="contact-details">
              <h3>Office Location</h3>
              <p>Visit us for professional consultations.</p>
              <p style={{ marginTop: '5px', fontWeight: '500' }}>
                BBD University, <br /> Lucknow, Uttar Pradesh
              </p>
            </div>
          </div>
        </div>

        <div className="policy-content" style={{ marginTop: '40px' }}>
          <h2 style={{ marginTop: 0 }}>Send a Message</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '16px', fontWeight: '700' }}>Name</label>
                <input 
                   type="text" 
                   name="name"
                   className="form-input no-icon" 
                   placeholder="Your Name" 
                   value={formData.name}
                   onChange={handleChange}
                   style={{ height: '50px', fontSize: '16px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '16px', fontWeight: '700' }}>Email</label>
                <input 
                   type="email" 
                   name="email"
                   className="form-input no-icon" 
                   placeholder="Your Email" 
                   value={formData.email}
                   onChange={handleChange}
                   style={{ height: '50px', fontSize: '16px' }}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '16px', fontWeight: '700' }}>Subject</label>
              <input 
                 type="text" 
                 name="subject"
                 className="form-input no-icon" 
                 placeholder="How can we help?" 
                 value={formData.subject}
                 onChange={handleChange}
                 style={{ height: '50px', fontSize: '16px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '16px', fontWeight: '700' }}>Message</label>
              <textarea 
                 name="message"
                 className="form-input no-icon" 
                 placeholder="Describe your issue..." 
                 rows="5"
                 style={{ resize: 'none', fontSize: '16px' }}
                 value={formData.message}
                 onChange={handleChange}
              ></textarea>
            </div>
            <button 
              type="submit"
              className="btn btn-primary btn-lg" 
              style={{ width: 'fit-content' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
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
