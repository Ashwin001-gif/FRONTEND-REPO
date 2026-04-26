import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';
import { markNotificationsRead } from '../utils/api';

const viewTitles = {
  dash: 'Dashboard',
  upload: 'Upload Files',
  files: 'My Files',
  share: 'Secure Sharing',
  access: 'Access Control',
  logs: 'Activity Logs',
  settings: 'Settings',
  admin: 'Admin Panel',
};

export default function Topbar({ activeView, onViewChange, onMenuOpen }) {
  const { toggleTheme } = useTheme();
  const showToast = useToast();
  const { unreadCount, notifications, setUnreadCount } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await markNotificationsRead(userInfo.token);
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <header className="topbar">

      <h1 className="topbar-title">{viewTitles[activeView] || 'Dashboard'}</h1>

      <div className="topbar-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search encrypted files..." />
      </div>

      <div className="topbar-actions">
        <div className="topbar-nav-controls" style={{ marginRight: '10px' }}>
          <button className="nav-btn" onClick={() => window.history.back()} title="Go Back">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="nav-btn" onClick={() => window.history.forward()} title="Go Forward">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <div className="topbar-btn" onClick={toggleTheme} title="Toggle theme">
          <i className="fa-solid fa-circle-half-stroke"></i>
        </div>
        
        <div className="topbar-btn" title="Notifications" onClick={handleBellClick} style={{ position: 'relative' }}>
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && <div className="notif-dot">{unreadCount}</div>}
          
          {showDropdown && (
            <div className="notif-dropdown">
              <div className="notif-header">Notifications</div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="notif-item">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">{new Date(n.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div 
          className="topbar-btn" 
          title="Security status" 
          onClick={() => showToast('Vault Security: Active. All files are E2E encrypted with AES-256. Your master key is safe in this session.', 'success')}
        >
          <i className="fa-solid fa-lock" style={{ color: 'var(--success)', fontSize: 12 }}></i>
        </div>
        <div className="topbar-avatar" onClick={() => onViewChange('settings')}>
          {(() => {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo).username?.substring(0,1).toUpperCase() : 'U';
          })()}
        </div>
      </div>
    </header>
  );
}
