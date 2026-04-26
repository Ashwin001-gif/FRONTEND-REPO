import { useToast } from '../context/ToastContext';

export default function DeleteModal({ isOpen, onClose, onConfirm, fileName = 'Q4_Report_Final.pdf' }) {
  const showToast = useToast();

  const handleDelete = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
      showToast('File permanently deleted', 'success');
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Delete File</div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="alert danger">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>This action is <strong>permanent and irreversible</strong>. The file will be cryptographically shredded.</span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Are you sure you want to permanently delete <strong>{fileName}</strong>?
        </p>

        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)'
        }}>
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--blue-primary)', marginRight: 6 }}></i>
          Secure deletion uses 7-pass DoD 5220.22-M standard wiping
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="fa-solid fa-trash"></i> Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
