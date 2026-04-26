import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedFileMeta, downloadSharedFile } from '../utils/api';
import { base64ToBuffer, decryptFileData } from '../utils/crypto';

export default function PublicShare() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await getSharedFileMeta(id);
        setMeta(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      // 1. Fetch the encrypted Blob
      const encryptedBuffer = await downloadSharedFile(id, password);

      // 2. Get the decryption key from the URL fragment (Zero Knowledge)
      const hash = window.location.hash;
      if (!hash || !hash.startsWith('#key=')) {
        throw new Error('Decryption key is missing from the URL. Ensure you copied the full link including the #key= part.');
      }
      
      const fileKeyBase64 = hash.split('#key=')[1];
      const rawFileKey = base64ToBuffer(fileKeyBase64);

      // 3. Import the key
      const fileKey = await window.crypto.subtle.importKey(
        'raw',
        rawFileKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // 4. Decrypt the file
      const decryptedBuffer = await decryptFileData(encryptedBuffer, meta.fileIV, fileKey);

      // 5. Trigger download
      console.log('Triggering shared download for:', meta.originalName);
      const blob = new Blob([decryptedBuffer], { type: meta.mimetype || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = meta.originalName || 'shared_file';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Decryption failed. Incorrect password or invalid link.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="auth-page"><div style={{ color: 'white' }}>Loading secure link...</div></div>;
  }

  if (error && !meta) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 40, color: 'var(--danger)', marginBottom: 20 }}></i>
          <h2 className="auth-title">Link Invalid</h2>
          <p className="auth-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="share-file-preview" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <div className="share-file-icon pdf" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <i className="fa-solid fa-file" style={{ color: 'var(--blue-primary)' }}></i>
          </div>
          <div className="share-file-meta" style={{ textAlign: 'left' }}>
            <div className="share-file-name">{meta.originalName}</div>
            <div className="share-file-size">{(meta.size/1024/1024).toFixed(2)} MB · End-to-End Encrypted</div>
          </div>
        </div>

        <h2 className="auth-title">Secure File Shared with You</h2>
        <p className="auth-subtitle">This file is encrypted. Decryption happens locally on your device.</p>

        {error && (
          <div className="alert danger mb-20 text-left">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {meta.requiresPassword && (
          <div className="form-group text-left" style={{ marginTop: 24 }}>
            <label className="form-label">Enter Password to Download</label>
            <div className="input-wrap">
              <i className="fa-solid fa-lock input-icon"></i>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Share password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <button 
          className="btn btn-primary btn-full btn-lg mt-20" 
          onClick={handleDownload} 
          disabled={downloading || (meta.requiresPassword && !password)}
        >
          <i className="fa-solid fa-download"></i> {downloading ? 'Decrypting & Downloading...' : 'Download Securely'}
        </button>

        <div className="alert info mt-20 text-left">
          <i className="fa-solid fa-shield-halved"></i>
          <span><strong>Zero Knowledge:</strong> The server cannot see the contents of this file. It is decrypted locally in your browser using the key provided in the URL.</span>
        </div>
      </div>
    </div>
  );
}
