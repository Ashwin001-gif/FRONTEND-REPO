import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getUserStats } from '../utils/api';

const chartHeights = [0, 0, 0, 15, 0, 0, 0]; // Default flat chart with small bump for today
const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Remove hardcoded quickFiles

export default function DashboardView({ onViewChange }) {
  const showToast = useToast();
  const [stats, setStats] = useState({ totalFiles: 0, totalStorageMB: 0, sharedCount: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : { username: 'User' };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats(user.token);
        setStats(data);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token, showToast]);

  const getIconData = (action) => {
    if (action.includes('UPLOAD')) return { bg: 'rgba(59,130,246,0.1)', color: 'var(--blue-primary)', icon: 'fa-cloud-arrow-up' };
    if (action.includes('SHARE')) return { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', icon: 'fa-share-nodes' };
    if (action.includes('DOWNLOAD') || action.includes('ACCESSED')) return { bg: 'rgba(34,211,238,0.1)', color: 'var(--cyan)', icon: 'fa-cloud-arrow-down' };
    return { bg: 'var(--success-bg)', color: 'var(--success)', icon: 'fa-right-to-bracket' };
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Synchronizing vault...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Good morning, {user.username.split(' ')[0]} 👋</h1>
          <p>Your vault is secured with AES-256 encryption · Last active: just now</p>
        </div>
        <button className="btn btn-primary" onClick={() => onViewChange('upload')}>
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Files
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card blue">
          <div className="stat-icon blue"><i className="fa-solid fa-files"></i></div>
          <div className="stat-num">{stats.totalFiles || 0}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><i className="fa-solid fa-database"></i></div>
          <div className="stat-num">{stats.totalStorageMB || 0}<span style={{ fontSize: 14, fontWeight: 500 }}> MB</span></div>
          <div className="stat-label">Storage Used</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><i className="fa-solid fa-share-nodes"></i></div>
          <div className="stat-num">{stats.sharedCount || 0}</div>
          <div className="stat-label">Shared Files</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><i className="fa-solid fa-shield-check"></i></div>
          <div className="stat-num">100<span style={{ fontSize: 14 }}>%</span></div>
          <div className="stat-label">Encrypted</div>
          <div className="stat-change up" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Secure</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-subtitle">Last 24 hours</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onViewChange('logs')}>View all</button>
          </div>
          <div className="activity-list">
            {stats.recentActivity.map((item, i) => {
              const iconData = getIconData(item.action);
              return (
                <div key={i} className="activity-item">
                  <div className="activity-icon-wrap" style={{ background: iconData.bg, color: iconData.color }}>
                    <i className={`fa-solid ${iconData.icon}`}></i>
                  </div>
                  <div className="activity-info">
                    <div className="activity-name">{item.details}</div>
                    <div className="activity-detail">{item.action} · IP: {item.ipAddress}</div>
                  </div>
                  <div className="activity-time">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              );
            })}
            {stats.recentActivity.length === 0 && <div className="text-muted" style={{padding: 20}}>No recent activity found.</div>}
          </div>
        </div>

        {/* Upload Activity Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Upload Activity</div>
              <div className="card-subtitle">Files uploaded this week</div>
            </div>
            <span className="badge blue">This week</span>
          </div>
          <div className="mini-chart">
            {chartHeights.map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: `${h}%` }} title={`${Math.round(h / 10)} files`}></div>
            ))}
          </div>
          <div className="chart-labels">
            {chartDays.map(d => <span key={d} className="chart-label">{d}</span>)}
          </div>
          <div className="divider"></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
            <div>
              <div className="text-muted text-sm mb-4">Total Uploads</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{stats.totalFiles || 0}</div>
            </div>
            <div>
              <div className="text-muted text-sm mb-4">Data Transferred</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{stats.totalStorageMB || 0} <span style={{ fontSize: 13, fontWeight: 500 }}>MB</span></div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="card full">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Access</div>
              <div className="card-subtitle">Recently accessed files</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onViewChange('files')}>Browse all files →</button>
          </div>
          <div className="file-grid-view">
            {stats.totalFiles === 0 ? (
              <div className="text-muted" style={{ padding: '20px 0' }}>No files found.</div>
            ) : (
              <div
                className="file-grid-item"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 110, borderStyle: 'dashed' }}
                onClick={() => onViewChange('files')}
              >
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: 20, marginBottom: 6, display: 'block' }}></i>
                  <div style={{ fontSize: 12 }}>View all {stats.totalFiles} files</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
