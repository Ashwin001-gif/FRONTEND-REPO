import { useState, useEffect } from 'react';
import InviteModal from '../components/InviteModal';
import { useToast } from '../context/ToastContext';
import { getUserFiles, revokeUserAccess } from '../utils/api';

export default function AccessView() {
  const showToast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      const token = JSON.parse(userInfoStr).token;
      const data = await getUserFiles(token);
      setFiles(data);
      if (data.length > 0 && !selectedFile) {
        setSelectedFile(data[0]);
      } else if (selectedFile) {
        setSelectedFile(data.find(f => f._id === selectedFile._id) || data[0]);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  async function revoke(userId) {
    if (!selectedFile) return;
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      await revokeUserAccess(selectedFile._id, userId, token);
      showToast('Access revoked successfully', 'success');
      fetchFiles(); // Refresh data
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  const accessList = selectedFile?.accessList || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Access Control</h1>
          <p>Manage who can view, edit, or download your files</p>
        </div>
        <button className="btn btn-primary" onClick={() => setInviteOpen(true)} disabled={!selectedFile}>
          <i className="fa-solid fa-user-plus"></i> Invite User
        </button>
      </div>

      <div className="card mb-20">
        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div className="setting-label">Select File to Manage Access</div>
          <select 
            className="form-input" 
            onChange={(e) => setSelectedFile(files.find(f => f._id === e.target.value))}
            value={selectedFile?._id || ''}
          >
            {files.map(f => (
              <option key={f._id} value={f._id}>{f.originalName} ({(f.size/1024/1024).toFixed(2)} MB)</option>
            ))}
            {files.length === 0 && <option value="">No files available</option>}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Shared Users</div>
            <div className="card-subtitle">{selectedFile ? selectedFile.originalName : 'No file selected'}</div>
          </div>
          <span className="badge blue">{accessList.length} users</span>
        </div>
        <table className="perm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>View</th>
              <th>Download</th>
              <th>Edit</th>
              <th>Re-share</th>
              <th>Watermark</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!selectedFile ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Select a file above to view its access list.
                </td>
              </tr>
            ) : accessList.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No users have access to this file yet. Click 'Invite User' to start sharing.
                </td>
              </tr>
            ) : (
              accessList.map((a, i) => {
                const u = a.user;
                if (!u) return null;
                const initials = u.username ? u.username.substring(0, 2).toUpperCase() : '??';
                return (
                  <tr key={i}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: 'var(--blue-primary)' }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{u.username}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><input type="checkbox" className="perm-check" checked={a.permissions?.view || false} readOnly /></td>
                    <td><input type="checkbox" className="perm-check" checked={a.permissions?.download || false} readOnly /></td>
                    <td><input type="checkbox" className="perm-check" checked={a.permissions?.edit || false} readOnly /></td>
                    <td><input type="checkbox" className="perm-check" checked={a.permissions?.reshare || false} readOnly /></td>
                    <td>
                      {a.permissions?.watermark ? (
                        <span className="badge green" style={{ fontSize: 10 }}><i className="fa-solid fa-droplet"></i> On</span>
                      ) : (
                        <span className="text-muted text-sm">Off</span>
                      )}
                    </td>
                    <td className="text-muted text-sm">{a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => revoke(u._id)}>Revoke</button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <InviteModal 
        isOpen={inviteOpen} 
        onClose={() => setInviteOpen(false)} 
        selectedFile={selectedFile}
        onSuccess={fetchFiles}
      />
    </div>
  );
}
