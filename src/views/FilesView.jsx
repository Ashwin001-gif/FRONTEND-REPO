import { useState, useEffect } from 'react';
import DeleteModal from '../components/DeleteModal';
import DecryptionModal from '../components/DecryptionModal';
import SecureViewerModal from '../components/SecureViewerModal';
import { useToast } from '../context/ToastContext';
import { getUserFiles, getSharedWithMeFiles, downloadEncryptedFile, downloadSharedWithMeFile, deleteFile } from '../utils/api';
import { deriveMasterKey, decryptFileKey, decryptFileData, decryptStringAES, decryptAESKeyWithRSA } from '../utils/crypto';

export default function FilesView({ onViewChange }) {
  const showToast = useToast();
  const [viewMode, setViewMode] = useState('list');
  const [deleteModal, setDeleteModal] = useState({ open: false, fileId: null, fileName: '' });
  const [decryptModal, setDecryptModal] = useState({ open: false, file: null, isShared: false, mode: 'download' });
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('my_files'); // 'my_files' or 'shared_with_me'
  const [loading, setLoading] = useState(true);
  const [secureViewer, setSecureViewer] = useState({ open: false, blobUrl: null, fileName: '', mimetype: '', watermarkEmail: '', showWatermark: false });

  const getMasterPassword = () => sessionStorage.getItem('zk_master_password');
  const getUserToken = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo).token : null;
  };
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = getUserToken();
      const [myData, sharedData] = await Promise.all([
        getUserFiles(token),
        getSharedWithMeFiles(token)
      ]);
      setFiles(myData);
      setSharedFiles(sharedData);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = async (file, isShared = false) => {
    // Try using session password first for smoother UX
    const sessionPassword = sessionStorage.getItem('zk_master_password');
    const mode = (isShared && file.accessList?.[0] && !file.accessList[0].permissions?.download) ? 'secure_view' : 'download';
    
    if (sessionPassword) {
      // Temporarily set state for proceedWithDownload to use
      setDecryptModal({ open: false, file, isShared, mode });
      // We need to wait for state to update? No, we can just call it with the object
      await proceedWithDownload(sessionPassword, { file, isShared, mode });
    } else {
      setDecryptModal({ open: true, file, isShared, mode });
    }
  };

  const proceedWithDownload = async (password, currentConfig = null) => {
    const config = currentConfig || decryptModal;
    const { file, isShared, mode } = config;
    const userInfo = getUserInfo();
    const token = userInfo?.token;

    if (!file || !token) {
      showToast('Authentication error or file missing.', 'error');
      return;
    }

    if (decryptModal.open) setDecryptModal({ open: false, file: null, isShared: false, mode: 'download' });
    if (mode === 'secure_view') {
      try {
        showToast('Decrypting for Secure View...', 'info');
        const encryptedBuffer = await downloadSharedWithMeFile(file._id, token);
        const masterKey = await deriveMasterKey(password);
        const [ivBase64, encryptedBase64] = userInfo.encryptedPrivateKey.split(':');
        const privateKeyBase64 = await decryptStringAES(encryptedBase64, ivBase64, masterKey);
        const myAccess = file.accessList[0];
        const fileKey = await decryptAESKeyWithRSA(myAccess.encryptedKeyForUser, privateKeyBase64);
        const decryptedBuffer = await decryptFileData(encryptedBuffer, file.fileIV, fileKey);
        
        const mimeType = file.mimetype || 'application/octet-stream';
        const blob = new Blob([decryptedBuffer], { type: mimeType });
        const blobUrl = window.URL.createObjectURL(blob);

        setSecureViewer({
          open: true,
          blobUrl,
          fileName: file.originalName,
          mimetype: mimeType,
          watermarkEmail: userInfo.email || '',
          showWatermark: myAccess.permissions?.watermark || false
        });
      } catch (error) {
        console.error(error);
        showToast('Decryption failed: Incorrect master password or corrupted file', 'error');
      }
      return;
    }

    try {
      setDecryptModal({ open: false, file: null, isShared: false, mode: 'download' });
      showToast(`Downloading & Decrypting ${file.originalName}...`, 'info');
      
      let encryptedBuffer;
      let fileKey;

      // 1. Fetch encrypted blob
      console.log('Fetching encrypted file data...');
      if (isShared) {
        encryptedBuffer = await downloadSharedWithMeFile(file._id, token);
      } else {
        encryptedBuffer = await downloadEncryptedFile(file._id, token);
      }
      
      if (!encryptedBuffer || encryptedBuffer.byteLength === 0) {
        throw new Error('Downloaded file data is empty or invalid.');
      }
      
      console.log('Deriving master key...');
      // 2. Cryptography setup
      const masterKey = await deriveMasterKey(password);
      
      console.log('Decrypting file key...');
      // 3. Decrypt the file key
      if (isShared) {
        // Shared file: PKI Decryption flow
        if (!userInfo.encryptedPrivateKey) throw new Error('Your account does not have a private key setup.');
        
        // Decrypt the private key
        const [ivBase64, encryptedBase64] = userInfo.encryptedPrivateKey.split(':');
        const privateKeyBase64 = await decryptStringAES(encryptedBase64, ivBase64, masterKey);
        
        // Find my access record
        const myAccess = file.accessList[0]; 
        if (!myAccess || !myAccess.encryptedKeyForUser) throw new Error('No access record found for this file.');
        
        // Decrypt AES file key using RSA Private Key
        fileKey = await decryptAESKeyWithRSA(myAccess.encryptedKeyForUser, privateKeyBase64);
      } else {
        // Own file: Standard decryption flow
        if (!file.encryptedKey || !file.keyIV) throw new Error('File encryption metadata is missing.');
        fileKey = await decryptFileKey(file.encryptedKey, file.keyIV, masterKey);
      }
      
      console.log('Decrypting file content...');
      // 4. Decrypt the actual file
      const decryptedBuffer = await decryptFileData(encryptedBuffer, file.fileIV, fileKey);
      
      // 5. Trigger download
      const fileName = file.originalName || 'vault_file';
      
      let mimeType = file.mimetype || 'application/octet-stream';
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeMap = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'mp4': 'video/mp4'
      };
      if (mimeMap[ext]) mimeType = mimeMap[ext];
      
      const blob = new Blob([decryptedBuffer], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      
      if (['pdf', 'png', 'jpg', 'jpeg', 'txt'].includes(ext)) {
        window.open(url, '_blank');
      }
      
      showToast(`Decrypted: ${fileName}`, 'success');
      
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 5000);
    } catch (error) {
      console.error('Decryption process failed:', error);
      const isKeyError = error.name === 'OperationError' || error.message.includes('decryption failed') || error.message.includes('decrypt');
      const errorMsg = isKeyError ? 'Incorrect Master Password. Please try again.' : `Error: ${error.message}`;
      showToast(errorMsg, 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteFile(deleteModal.fileId, getUserToken());
      setFiles(files.filter(f => f._id !== deleteModal.fileId));
      showToast('File deleted safely', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeleteModal({ open: false, fileId: null, fileName: '' });
    }
  };

  const getIconClass = (mimetype) => {
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('image')) return 'img';
    if (mimetype.includes('zip') || mimetype.includes('tar')) return 'zip';
    if (mimetype.includes('video')) return 'vid';
    return 'doc';
  };

  const getIcon = (mimetype) => {
    if (mimetype.includes('pdf')) return 'fa-file-pdf';
    if (mimetype.includes('image')) return 'fa-file-image';
    if (mimetype.includes('zip') || mimetype.includes('tar')) return 'fa-file-zipper';
    if (mimetype.includes('video')) return 'fa-file-video';
    return 'fa-file-word';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Files</h1>
          <p>{activeTab === 'my_files' ? files.length : sharedFiles.length} files · End-to-End Encrypted</p>
        </div>
        <button className="btn btn-primary" onClick={() => onViewChange('upload')}>
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload
        </button>
      </div>

      <div className="file-tabs" style={{ display: 'flex', gap: 20, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        <button 
          className={`tab-btn ${activeTab === 'my_files' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_files')}
          style={{ background: 'none', border: 'none', color: activeTab === 'my_files' ? 'var(--blue-primary)' : 'var(--text-muted)', fontSize: 16, fontWeight: 500, cursor: 'pointer', position: 'relative' }}
        >
          My Vault
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shared_with_me' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared_with_me')}
          style={{ background: 'none', border: 'none', color: activeTab === 'shared_with_me' ? 'var(--blue-primary)' : 'var(--text-muted)', fontSize: 16, fontWeight: 500, cursor: 'pointer', position: 'relative' }}
        >
          Shared With Me
        </button>
      </div>

      <div className="card mb-0">
        <div className="file-toolbar">
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search files..." />
          </div>
          <select className="filter-select">
            <option>All types</option>
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <i className="fa-solid fa-list"></i>
            </button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <i className="fa-solid fa-grip"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading your vault...</div>
        ) : (activeTab === 'my_files' ? files : sharedFiles).length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            {activeTab === 'my_files' ? 'No files found. Go upload something!' : 'No one has shared files with you yet.'}
          </div>
        ) : viewMode === 'list' ? (
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                {activeTab === 'shared_with_me' && <th>Owner</th>}
                <th>Encryption</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'my_files' ? files : sharedFiles).map((f) => (
                <tr key={f._id}>
                  <td>
                    <div className="file-name-cell">
                      <div className={`file-type-icon ${getIconClass(f.mimetype)}`} style={{ width: 32, height: 32, borderRadius: 8, fontSize: 13 }}>
                        <i className={`fa-solid ${getIcon(f.mimetype)}`}></i>
                      </div>
                      {f.originalName}
                    </div>
                  </td>
                  <td className="text-muted">{(f.size / 1024 / 1024).toFixed(2)} MB</td>
                  {activeTab === 'shared_with_me' && (
                    <td className="text-muted">{f.user?.username || 'Unknown'}</td>
                  )}
                  <td><span className="enc-badge"><i className="fa-solid fa-lock"></i> {activeTab === 'my_files' ? 'AES-256' : 'AES+RSA'}</span></td>
                  <td>
                    <div className="file-actions">
                      {activeTab === 'shared_with_me' && !f.accessList?.[0]?.permissions?.download ? (
                        <button className="btn btn-ghost btn-icon btn-sm" title="Secure View" onClick={() => handleDownload(f, true)} style={{ color: 'var(--cyan)' }}>
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-icon btn-sm" title="Download & Decrypt" onClick={() => handleDownload(f, activeTab === 'shared_with_me')}>
                          <i className="fa-solid fa-download"></i>
                        </button>
                      )}
                      {activeTab === 'my_files' && (
                        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteModal({ open: true, fileId: f._id, fileName: f.originalName })}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="file-grid-view">
            {(activeTab === 'my_files' ? files : sharedFiles).map((f) => (
              <div key={f._id} className="file-grid-item">
                <div className="file-grid-icon">
                  <i className={`fa-solid ${getIcon(f.mimetype)}`}></i>
                </div>
                <div className="file-grid-name">{f.originalName}</div>
                <div className="file-grid-size">
                  {(f.size / 1024 / 1024).toFixed(2)} MB 
                  {activeTab === 'shared_with_me' && <div style={{ fontSize: 11, marginTop: 4, color: 'var(--blue-primary)' }}>By: {f.user?.username}</div>}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 5 }}>
                  {activeTab === 'shared_with_me' && !f.accessList?.[0]?.permissions?.download ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(f, true)}>
                      <i className="fa-solid fa-eye"></i> Secure View
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleDownload(f, activeTab === 'shared_with_me')}>Download</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, fileId: null, fileName: '' })}
        onConfirm={confirmDelete}
        fileName={deleteModal.fileName}
      />

      <DecryptionModal
        isOpen={decryptModal.open}
        onClose={() => setDecryptModal({ open: false, file: null, isShared: false, mode: 'download' })}
        onConfirm={proceedWithDownload}
        fileName={decryptModal.file?.originalName}
      />

      <SecureViewerModal
        isOpen={secureViewer.open}
        onClose={() => {
          if (secureViewer.blobUrl) window.URL.revokeObjectURL(secureViewer.blobUrl);
          setSecureViewer({ open: false, blobUrl: null, fileName: '', mimetype: '', watermarkEmail: '', showWatermark: false });
        }}
        blobUrl={secureViewer.blobUrl}
        fileName={secureViewer.fileName}
        mimetype={secureViewer.mimetype}
        watermarkEmail={secureViewer.watermarkEmail}
        showWatermark={secureViewer.showWatermark}
      />
    </div>
  );
}
