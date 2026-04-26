import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getUserLogs, getAdminStats } from '../utils/api';

export default function LogsView() {
  const showToast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let data;
        if (user.role === 'admin') {
          const stats = await getAdminStats(user.token);
          data = stats.recentLogs;
        } else {
          data = await getUserLogs(user.token);
        }
        setLogs(data);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user.token, user.role, showToast]);

  const getIconData = (action) => {
    if (action.includes('UPLOAD')) return { bg: 'rgba(59,130,246,0.2)', color: 'var(--blue-primary)', icon: 'fa-arrow-up' };
    if (action.includes('SHARE')) return { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', icon: 'fa-share' };
    if (action.includes('DOWNLOAD') || action.includes('ACCESSED')) return { bg: 'rgba(34,211,238,0.2)', color: 'var(--cyan)', icon: 'fa-arrow-down' };
    if (action.includes('LOGIN') || action.includes('REGISTER')) return { bg: 'var(--success-bg)', color: 'var(--success)', icon: 'fa-right-to-bracket' };
    if (action.includes('DELETE')) return { bg: 'var(--danger-bg)', color: 'var(--danger)', icon: 'fa-trash' };
    return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)', icon: 'fa-info' };
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading audit logs...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Activity Logs</h1>
          <p>{user.role === 'admin' ? 'Global system audit trail' : 'Your personal activity log'}</p>
        </div>
      </div>

      <div className="timeline">
        {logs.map((item, i) => {
          const style = getIconData(item.action);
          return (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" style={{ background: style.bg, color: style.color }}>
                <i className={`fa-solid ${style.icon}`}></i>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-action">{item.action}</span>
                  <span className="timeline-time">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="timeline-desc">{item.details} · IP: {item.ipAddress}</div>
              </div>
            </div>
          )
        })}
        {logs.length === 0 && <div className="text-muted" style={{padding: 20}}>No logs found in your vault.</div>}
      </div>
    </div>
  );
}
