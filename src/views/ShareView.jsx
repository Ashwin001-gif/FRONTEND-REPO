import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getUserFiles, createShareLink } from '../utils/api';
import { deriveMasterKey, decryptFileKey, bufferToBase64 } from '../utils/crypto';

export default function ShareView() {
  const showToast = useToast();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [passEnabled, setPassEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getMasterPassword = () => sessionStorage.getItem('zk_master_password');
  const getUserToken = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo).token : null;
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await getUserFiles(getUserToken());
        setFiles(data);
        if (data.length > 0) setSelectedFile(data[0]);
      } catch (error) {
        showToast(error.message, 'error');
      }
    };
    fetchFiles();
  }, []);

  async function generateLink() {
    if (!selectedFile) return showToast('Select a file first', 'error');

    setLoading(true);
    try {
      const token = getUserToken();
      const masterPass = getMasterPassword();
      if (!token || !masterPass) throw new Error('Authentication error');

      // Create backend share link (this returns shareId)
      const data = await createShareLink(selectedFile._id, passEnabled ? password : null, token);
      
      // Zero Knowledge step: Decrypt the file key and put it in the URL fragment
      const masterKey = await deriveMasterKey(masterPass);
      const fileKey = await decryptFileKey(selectedFile.encryptedKey, selectedFile.keyIV, masterKey);
      
      const rawFileKey = await window.crypto.subtle.exportKey('raw', fileKey);
      const fileKeyBase64 = bufferToBase64(rawFileKey);

      // Construct final URL
      const url = `${window.location.origin}/share/${data.shareId}#key=${fileKeyBase64}`;
      setShareLink(url);
      showToast('Zero-Knowledge Secure link generated!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(shareLink).catch(() => {});
    showToast('Link copied to clipboard', 'success');
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Secure File Sharing</h1>
          <p>Generate encrypted shareable links with Zero-Knowledge guarantees</p>
        </div>
      </div>

      <div className="share-layout">
        <div>
          <div className="card">
            <div className="card-title mb-16">Generate Secure Link</div>

            <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
              <div className="setting-label">Select File to Share</div>
              <select 
                className="form-input" 
                onChange={(e) => setSelectedFile(files.find(f => f._id === e.target.value))}
                value={selectedFile?._id || ''}
              >
                {files.map(f => (
                  <option key={f._id} value={f._id}>{f.originalName} ({(f.size/1024/1024).toFixed(2)} MB)</option>
                ))}
              </select>
            </div>

            {selectedFile && (
              <div className="share-file-preview mb-20">
                <div className="share-file-icon pdf" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <i className="fa-solid fa-file" style={{ color: 'var(--blue-primary)' }}></i>
                </div>
                <div className="share-file-meta">
                  <div className="share-file-name">{selectedFile.originalName}</div>
                  <div className="share-file-size">{(selectedFile.size/1024/1024).toFixed(2)} MB · AES-256 Encrypted</div>
                </div>
                <span className="enc-badge"><i className="fa-solid fa-lock"></i> E2E</span>
              </div>
            )}

            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Password Protection</div>
                <div className="setting-desc">Require a password to download</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={passEnabled} onChange={e => setPassEnabled(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {passEnabled && (
              <div style={{ margin: '12px 0' }}>
                <div className="input-wrap">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter share password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={generateLink} disabled={loading || !selectedFile}>
              <i className="fa-solid fa-link"></i> {loading ? 'Generating...' : 'Generate Secure Link'}
            </button>
          </div>
        </div>

        <div>
          <div className="card mb-20">
            <div className="card-title mb-8">Your Secure Link</div>
            <p className="text-muted text-sm mb-16">
              This link contains the decryption key in the URL fragment (<code>#key=...</code>). The server never sees it!
            </p>
            <div className="link-output">
              <div className="link-text">{shareLink || 'Generate a link to see it here...'}</div>
              <button className="link-copy-btn" onClick={copyLink} disabled={!shareLink}>
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            
            <div className="alert info mt-20">
              <i className="fa-solid fa-circle-info"></i>
              <span><strong>Zero Knowledge:</strong> If you lose this link, the recipient will not be able to decrypt the file. We do not store the share key!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
