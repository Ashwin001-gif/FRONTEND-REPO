import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getUserByEmail, inviteUserToFile } from '../utils/api';
import { deriveMasterKey, decryptFileKey, encryptAESKeyWithRSA } from '../utils/crypto';

export default function InviteModal({ isOpen, onClose, selectedFile, onSuccess }) {
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [watermark, setWatermark] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return showToast('Please enter an email address', 'error');
    if (!selectedFile) return showToast('No file selected', 'error');

    setLoading(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) throw new Error('Not logged in');
      const token = JSON.parse(userInfoStr).token;
      
      const masterPass = sessionStorage.getItem('zk_master_password');
      if (!masterPass) throw new Error('Master password not found in session');

      const invitee = await getUserByEmail(email, token);
      const masterKey = await deriveMasterKey(masterPass);
      const aesFileKey = await decryptFileKey(selectedFile.encryptedKey, selectedFile.keyIV, masterKey);
      const encryptedKeyForUser = await encryptAESKeyWithRSA(aesFileKey, invitee.publicKey);

      const permissions = {
        view: true,
        download: role === 'viewer' || role === 'editor',
        edit: role === 'editor',
        reshare: false,
        watermark: role === 'secure_view' ? watermark : false
      };

      await inviteUserToFile(selectedFile._id, invitee._id, encryptedKeyForUser, permissions, token);

      showToast(`Successfully invited ${invitee.username}`, 'success');
      setEmail('');
      setRole('viewer');
      setWatermark(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Invite User to File</div>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrap">
            <i className="fa-solid fa-envelope input-icon"></i>
            <input 
              type="email" 
              className="form-input" 
              placeholder="colleague@company.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Permission Level</label>
          <select 
            className="form-input no-icon" 
            value={role} 
            onChange={e => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="secure_view">Secure View — Browser only (Anti-Screenshot)</option>
            <option value="viewer">Viewer — Can view and download</option>
            <option value="editor">Editor — Can view, download & edit</option>
          </select>
        </div>

        {role === 'secure_view' && (
          <label className="check-row" style={{ marginBottom: 20 }}>
            <input 
              type="checkbox" 
              checked={watermark}
              onChange={e => setWatermark(e.target.checked)}
              disabled={loading}
            />
            Add Email Watermark Overlay
          </label>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
            <i className="fa-solid fa-paper-plane"></i> {loading ? 'Encrypting...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
