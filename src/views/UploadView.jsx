import { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { uploadEncryptedFile } from '../utils/api';
import { deriveMasterKey, generateFileKey, encryptFileData, encryptFileKey } from '../utils/crypto';

export default function UploadView() {
  const showToast = useToast();
  const [queue, setQueue] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const getMasterPassword = () => {
    return sessionStorage.getItem('zk_master_password');
  };

  const getUserToken = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo).token : null;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const processFiles = async (files) => {
    const password = getMasterPassword();
    const token = getUserToken();

    if (!password || !token) {
      showToast('Authentication error. Please log in again.', 'error');
      return;
    }

    for (const file of files) {
      const newId = Date.now() + Math.random();
      const newItem = {
        id: newId,
        iconClass: 'doc',
        icon: 'fa-file',
        name: file.name,
        meta: `${(file.size / 1024 / 1024).toFixed(2)} MB · Processing...`,
        progress: 0,
        done: false,
      };
      
      setQueue(prev => [...prev, newItem]);

      try {
        // 1. Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        setQueue(prev => prev.map(item => item.id === newId ? { ...item, progress: 20, meta: 'Encrypting data...' } : item));

        // 2. Cryptography
        const masterKey = await deriveMasterKey(password);
        const fileKey = await generateFileKey();
        
        const { encryptedBlob, fileIVBase64 } = await encryptFileData(arrayBuffer, fileKey);
        
        setQueue(prev => prev.map(item => item.id === newId ? { ...item, progress: 50, meta: 'Encrypting key...' } : item));

        const { encryptedKeyBase64, keyIVBase64 } = await encryptFileKey(fileKey, masterKey);

        setQueue(prev => prev.map(item => item.id === newId ? { ...item, progress: 70, meta: 'Uploading to vault...' } : item));

        // 3. Upload
        const formData = new FormData();
        formData.append('file', encryptedBlob, file.name); // Send blob as file
        formData.append('originalName', file.name);
        formData.append('size', file.size);
        formData.append('mimetype', file.type || 'application/octet-stream');
        formData.append('encryptedKey', encryptedKeyBase64);
        formData.append('fileIV', fileIVBase64);
        formData.append('keyIV', keyIVBase64);

        await uploadEncryptedFile(formData, token);

        setQueue(prev => prev.map(item => item.id === newId ? { ...item, progress: 100, done: true, meta: 'Uploaded successfully' } : item));
        showToast('File encrypted & uploaded', 'success');
      } catch (error) {
        console.error(error);
        setQueue(prev => prev.map(item => item.id === newId ? { ...item, progress: 0, meta: 'Upload failed: ' + error.message } : item));
        showToast('Failed to upload ' + file.name, 'error');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Upload Files</h1>
          <p>Files are encrypted client-side before upload. Your key never leaves your device.</p>
        </div>
      </div>

      <div className="alert success mb-20">
        <i className="fa-solid fa-lock"></i>
        <span><strong>End-to-End Encryption Active:</strong> Files are encrypted with AES-256-GCM before upload. Zero-knowledge guarantee.</span>
      </div>

      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="drop-zone-inner">
          <div className="drop-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
          <div className="drop-title">Drop files here to encrypt &amp; upload</div>
          <div className="drop-sub">or click to browse</div>
          <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            <i className="fa-solid fa-folder-open"></i> Browse Files
          </button>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelect}
          />
          <div className="drop-types" style={{ marginTop: 16 }}>
            {['PDF', 'DOCX', 'PNG/JPG', 'MP4', 'ZIP/TAR', '+ more'].map(t => (
              <span key={t} className="drop-type-badge">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="upload-queue">
        {queue.map(item => (
          <div key={item.id} className="upload-item">
            <div className={`file-type-icon ${item.iconClass}`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <div className="upload-info">
              <div className="upload-name">{item.name}</div>
              <div className="upload-meta">{item.meta}</div>
              <div className="progress-bar">
                <div className={`progress-fill ${item.done ? 'done' : ''}`} style={{ width: `${item.progress}%` }}></div>
              </div>
              <div className="upload-status">
                <span className={`upload-pct ${item.done ? 'done' : ''}`}>
                  {item.done ? <><i className="fa-solid fa-check-circle"></i> Encrypted &amp; Uploaded</> : `${item.progress}%`}
                </span>
                <span className="encrypt-badge">
                  <i className="fa-solid fa-lock"></i> {item.done ? 'AES-256' : 'Encrypting'}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setQueue(q => q.filter(x => x.id !== item.id))}>
              <i className={`fa-solid ${item.done ? 'fa-check' : 'fa-xmark'}`}></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
