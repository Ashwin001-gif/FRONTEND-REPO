import { useNavigate } from 'react-router-dom';

const navItems = [
  { view: 'dash', icon: 'fa-gauge-high', label: 'Dashboard', section: 'Main' },
  { view: 'upload', icon: 'fa-cloud-arrow-up', label: 'Upload Files' },
  { view: 'files', icon: 'fa-folder-closed', label: 'My Files' },
  { view: 'share', icon: 'fa-share-nodes', label: 'Secure Share', section: 'Sharing' },
  { view: 'access', icon: 'fa-user-shield', label: 'Access Control' },
  { view: 'logs', icon: 'fa-clock-rotate-left', label: 'Activity Logs', section: 'Monitoring' },
  { view: 'settings', icon: 'fa-gear', label: 'Settings', section: 'Account' },
  { view: 'admin', icon: 'fa-user-tie', label: 'Admin Panel' },
];

export default function Sidebar({ activeView, onViewChange, isOpen, onClose }) {
  const navigate = useNavigate();
  
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : { username: 'User', role: 'user' };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('zk_master_password');
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon" style={{ width: 34, height: 34, fontSize: 15 }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="sidebar-brand">ZK Vault</span>
          <span className="sidebar-ver">v1.0</span>
        </div>

        <div className="sidebar-storage">
          <div className="storage-label">
            <span>Security Status</span>
            <span className="storage-num">E2E Active</span>
          </div>
          <div className="storage-bar">
            <div className="storage-fill" style={{ width: '100%', background: 'var(--success)' }}></div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => (
            <div key={item.view}>
              {item.section && (
                <div className="nav-section-label">
                  {item.section}
                </div>
              )}
              <div
                className={`nav-item ${activeView === item.view ? 'active' : ''}`}
                onClick={() => { onViewChange(item.view); onClose(); }}
                style={(item.view === 'admin' || item.view === 'logs') && user.role !== 'admin' ? { display: 'none' } : {}}
              >
                <i className={`fa-solid ${item.icon} nav-icon`}></i>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">
              {user.username?.substring(0,1).toUpperCase()}
              <div className="avatar-online"></div>
            </div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role" style={{textTransform: 'capitalize'}}>{user.role} Account</div>
            </div>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
    </>
  );
}
