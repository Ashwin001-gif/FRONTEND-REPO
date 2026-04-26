import { useState } from 'react';

export default function DecryptionModal({ isOpen, onClose, onConfirm, fileName }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Decrypt & Download</div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="alert info">
          <i className="fa-solid fa-lock"></i>
          <span>This file is <strong>End-to-End Encrypted</strong>. You need your Master Password to decrypt it locally.</span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Enter your master password to access <strong>{fileName}</strong>:
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrap">
              <i className="fa-solid fa-key input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-unlock"></i> Decrypt Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
