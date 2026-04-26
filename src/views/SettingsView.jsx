import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, deleteAccount } from '../utils/api';

const navItems = [
  { icon: 'fa-user', label: 'Profile' },
  { icon: 'fa-lock', label: 'Security' },
  { icon: 'fa-bell', label: 'Notifications' },
  { icon: 'fa-palette', label: 'Appearance' },
  { icon: 'fa-triangle-exclamation', label: 'Danger Zone', danger: true },
];

export default function SettingsView() {
  const showToast = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeNav, setActiveNav] = useState('Profile');
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setUsername(userInfo.username || '');
      setEmail(userInfo.email || '');
      setRole(userInfo.role || 'user');
    }
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) throw new Error('Not logged in');
      const userInfo = JSON.parse(userInfoStr);

      const updatedData = await updateProfile(username, email, userInfo.token);
      
      // Update local storage with new info
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...updatedData }));
      
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    try {
      setLoading(true);
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);

      await deleteAccount(userInfo.token);
      
      showToast('Account deleted. We are sorry to see you go.', 'info');
      
      // Logout and redirect
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('zk_master_password');
      navigate('/login');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your account, security, and vault preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {navItems.map(item => (
            <div
              key={item.label}
              className={`settings-nav-item ${activeNav === item.label ? 'active' : ''}`}
              style={item.danger ? { color: 'var(--danger)' } : {}}
              onClick={() => setActiveNav(item.label)}
            >
              <i className={`fa-solid ${item.icon}`}></i> {item.label}
            </div>
          ))}
        </div>

        <div className="settings-content">
          {activeNav === 'Profile' && (
            <div className="card">
              <div className="card-title mb-16">Profile Information</div>
              <div className="avatar-upload">
                <div className="avatar-lg" style={{ background: 'linear-gradient(135deg, var(--blue-primary), var(--cyan))'}}>
                  {username ? username.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="avatar-info">
                  <h3>{username || 'User'}</h3>
                  <p>{email} · <span style={{textTransform: 'capitalize'}}>{role}</span> Account</p>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-user input-icon"></i>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                <i className="fa-solid fa-check"></i> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeNav === 'Security' && (
            <>
              <div className="card">
                <div className="card-title mb-16">Security Settings</div>
                <div className="form-group">
                  <label className="check-row">
                    <input type="checkbox" defaultChecked /> Enable Two-Factor Authentication (MFA)
                  </label>
                  <p className="text-muted text-sm mt-4">Adds an extra layer of security to your vault.</p>
                </div>
                <button className="btn btn-secondary mt-16" onClick={() => setShowMFAModal(true)}>
                  Setup Authenticator App
                </button>

                {showMFAModal && (
                  <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
                      <div className="modal-header">
                        <h2>Setup Authenticator</h2>
                        <button className="modal-close" onClick={() => setShowMFAModal(false)}>&times;</button>
                      </div>
                      <p className="text-muted mb-20">Scan this QR code with Google Authenticator or Authy.</p>
                      <div style={{ background: '#fff', padding: 20, borderRadius: 12, display: 'inline-block', marginBottom: 20 }}>
                        {/* Mock QR Code */}
                        <div style={{ width: 150, height: 150, border: '10px solid #000', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)' }}>
                          {[...Array(25)].map((_, i) => (
                            <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff' }}></div>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-input" placeholder="Enter 6-digit code" maxLength="6" style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
                      </div>
                      <button className="btn btn-primary btn-full mt-16" onClick={() => { setShowMFAModal(false); showToast('MFA setup simulated successfully!', 'success'); }}>
                        Verify & Activate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card mt-20">
                <div className="card-title mb-16">Change Master Password</div>
                <div className="alert warning mb-16">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span><strong>Zero Knowledge Warning:</strong> Changing your master password requires re-encrypting all your files locally. This feature is disabled in this prototype to prevent accidental data loss.</span>
                </div>
                <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                  <i className="fa-solid fa-shield-halved"></i> Update Password (Disabled)
                </button>
              </div>
            </>
          )}

          {activeNav === 'Notifications' && (
            <div className="card">
              <div className="card-title mb-16">Notification Preferences</div>
              <div className="form-group">
                <label className="check-row mb-12">
                  <input type="checkbox" defaultChecked /> Real-time Desktop Notifications
                </label>
                <label className="check-row mb-12">
                  <input type="checkbox" defaultChecked /> Email alerts for suspicious logins
                </label>
                <label className="check-row mb-12">
                  <input type="checkbox" defaultChecked /> Notify me when a shared link is accessed
                </label>
              </div>
              <button className="btn btn-primary" onClick={() => showToast('Preferences saved', 'success')}>Save Preferences</button>
            </div>
          )}

          {activeNav === 'Appearance' && (
            <div className="card">
              <div className="card-title mb-16">Appearance</div>
              <p className="text-muted mb-16">Customize how ZK Vault looks on your device.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div 
                  className="card" 
                  style={{ 
                    cursor: 'pointer', 
                    border: theme === 'dark' ? '2px solid var(--blue-primary)' : '1px solid var(--border)', 
                    textAlign: 'center', 
                    padding: 20,
                    background: theme === 'dark' ? 'var(--bg-elevated)' : 'transparent'
                  }}
                  onClick={() => setTheme('dark')}
                >
                  <i className="fa-solid fa-moon" style={{ fontSize: 24, marginBottom: 8, color: theme === 'dark' ? 'var(--blue-primary)' : 'inherit' }}></i>
                  <div>Modern Dark</div>
                </div>
                <div 
                  className="card" 
                  style={{ 
                    cursor: 'pointer', 
                    border: theme === 'light' ? '2px solid var(--blue-primary)' : '1px solid var(--border)', 
                    textAlign: 'center', 
                    padding: 20,
                    background: theme === 'light' ? 'var(--bg-elevated)' : 'transparent'
                  }}
                  onClick={() => setTheme('light')}
                >
                  <i className="fa-solid fa-sun" style={{ fontSize: 24, marginBottom: 8, color: theme === 'light' ? 'var(--blue-primary)' : 'inherit' }}></i>
                  <div>Classic Light</div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'Danger Zone' && (
            <div className="card" style={{ border: '1px solid var(--danger)' }}>
              <div className="card-title mb-16" style={{ color: 'var(--danger)' }}>Danger Zone</div>
              <p className="text-muted mb-16">These actions are permanent and cannot be undone.</p>
              
              <div className="alert danger mb-16">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Deleting your account will permanently wipe all your encrypted files and keys. <strong>This cannot be reversed.</strong></span>
              </div>

              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete My Account and All Data
              </button>

              {showDeleteConfirm && (
                <div className="modal-overlay open">
                  <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
                    <div className="modal-header">
                      <h2 style={{ color: 'var(--danger)', fontSize: 20 }}>Confirm Deletion</h2>
                      <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
                    </div>
                    <p className="mb-20 text-muted">Are you absolutely sure? This will delete your entire vault and cannot be undone.</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-secondary flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button className="btn btn-danger flex-1" onClick={handleAccountDelete} disabled={loading}>
                        {loading ? 'Deleting...' : 'Yes, Delete Everything'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
