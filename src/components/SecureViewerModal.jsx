import { useState, useEffect, useRef } from 'react';

export default function SecureViewerModal({ isOpen, onClose, blobUrl, fileName, mimetype, watermarkEmail, showWatermark }) {
  const [blurred, setBlurred] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleVisibility = () => {
      if (document.hidden) setBlurred(true);
    };

    const handleBlur = () => setBlurred(true);
    const handleFocus = () => setBlurred(false);

    // Keyboard shortcuts block
    const handleKeyDown = (e) => {
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setBlurred(true);
        setTimeout(() => setBlurred(false), 2000);
      }
      // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy)
      if (e.ctrlKey && ['p', 's', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clean up blur when modal closes
  useEffect(() => {
    if (!isOpen) setBlurred(false);
  }, [isOpen]);

  if (!isOpen || !blobUrl) return null;

  const isImage = mimetype?.startsWith('image/');
  const isPDF = mimetype?.includes('pdf');
  const isText = mimetype?.startsWith('text/');

  const preventAction = (e) => e.preventDefault();

  return (
    <div className="secure-viewer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="secure-viewer-container" ref={containerRef}>
        {/* Header */}
        <div className="secure-viewer-header">
          <div className="secure-viewer-title">
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--blue-primary)' }}></i>
            <span>{fileName}</span>
            <span className="badge green" style={{ marginLeft: 8, fontSize: 10 }}>
              <i className="fa-solid fa-lock"></i> Secure View
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Area */}
        <div
          className={`secure-viewer-content ${blurred ? 'sv-blurred' : ''}`}
          onContextMenu={preventAction}
          onDragStart={preventAction}
          onCopy={preventAction}
        >
          {isImage && (
            <img
              src={blobUrl}
              alt="Secure View"
              className="secure-viewer-image"
              draggable={false}
            />
          )}

          {isPDF && (
            <iframe
              src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="secure-viewer-pdf"
              title="Secure PDF Viewer"
            />
          )}

          {isText && (
            <iframe
              src={blobUrl}
              className="secure-viewer-text"
              title="Secure Text Viewer"
            />
          )}

          {!isImage && !isPDF && !isText && (
            <div className="secure-viewer-unsupported">
              <i className="fa-solid fa-file-circle-exclamation" style={{ fontSize: 48, marginBottom: 16, color: 'var(--text-muted)' }}></i>
              <p>This file type cannot be previewed in Secure View.</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Only images, PDFs, and text files are supported for secure preview.</p>
            </div>
          )}

          {/* Watermark Overlay */}
          {showWatermark && watermarkEmail && (
            <div className="secure-viewer-watermark">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="watermark-text">{watermarkEmail}</span>
              ))}
            </div>
          )}

          {/* Blur Overlay when screenshot detected */}
          {blurred && (
            <div className="secure-viewer-blur-overlay">
              <i className="fa-solid fa-eye-slash" style={{ fontSize: 48, marginBottom: 12 }}></i>
              <p>Content hidden — Screenshot protection active</p>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Click back on this window to continue viewing</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="secure-viewer-footer">
          <i className="fa-solid fa-circle-info"></i>
          <span>Protected by Zero-Knowledge Secure View. Download, copy, and screenshots are restricted.</span>
        </div>
      </div>
    </div>
  );
}
