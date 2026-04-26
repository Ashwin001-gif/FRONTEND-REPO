import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getAdminStats, getUsers, updateUserStatus } from '../utils/api';

export default function AdminView() {
  const showToast = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, totalFiles: 0, totalStorageMB: 0, recentLogs: [] });
  const [users, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getUserToken = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo).token : null;
  };

  const fetchUsersData = async () => {
    try {
      const token = getUserToken();
      const statsData = await getAdminStats(token);
      setStats(statsData);
      
      const usersData = await getUsers(token);
      setUsersList(usersData);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      return showToast('Cannot change status of an admin user', 'error');
    }
    
    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await updateUserStatus(user._id, newStatus, getUserToken());
      showToast(`User ${user.username} has been ${newStatus}`, 'success');
      // Update local state to reflect the change immediately
      setUsersList(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Admin Dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Admin Panel</h1>
          <p>Platform overview and user management</p>
        </div>
        <span 
          className="badge" 
          style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}
          onClick={() => showToast('Super Admin: You have full control over user management and system-wide audit logs.', 'info')}
          title="Click to see your permissions"
        >
          <i className="fa-solid fa-user-shield" style={{ marginRight: 6 }}></i>Super Admin
        </span>
      </div>

      {/* Admin Stats */}
      <div className="admin-stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><i className="fa-solid fa-users"></i></div>
          <div className="stat-num">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><i className="fa-solid fa-server"></i></div>
          <div className="stat-num">{stats.totalStorageMB}<span style={{ fontSize: 14 }}> MB</span></div>
          <div className="stat-label">Total Storage</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><i className="fa-solid fa-files"></i></div>
          <div className="stat-num">{stats.totalFiles}</div>
          <div className="stat-label">Files Encrypted</div>
        </div>
      </div>

      <div className="dash-grid" style={{ gridTemplateColumns: '1fr', marginTop: 24 }}>
        {/* User Management Table */}
        <div className="card full">
          <div className="card-header">
            <div>
              <div className="card-title">User Management</div>
              <div className="card-subtitle">{filteredUsers.length} users found</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="search-input-wrap" style={{ width: 250 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg,#3b82f6,#22d3ee)' }}>
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-muted">{u.email}</span></td>
                  <td><span className={`role-badge ${u.role}`}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span></td>
                  <td>
                    <span className={`status-chip ${u.status === 'suspended' ? 'suspended' : 'active'}`}>
                      {u.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button 
                        className={`btn btn-sm ${u.status === 'suspended' ? 'btn-success' : 'btn-danger'}`} 
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.role === 'admin'}
                        style={u.role === 'admin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {u.status === 'suspended' ? 'Restore' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Audit Logs (Small preview) */}
        <div className="card full">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity Logs</div>
            </div>
          </div>
          <table className="users-table">
             <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.slice(0, 10).map((log, i) => (
                <tr key={i}>
                  <td><span className="badge blue">{log.action}</span></td>
                  <td>{log.username || 'Anonymous'}</td>
                  <td className="text-muted">{log.details}</td>
                  <td>{log.ipAddress}</td>
                  <td className="text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
