import { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import './Dialog.css';

interface AddClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function AddClientDialog({ isOpen, onClose }: AddClientDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const { createClient } = useScheduleStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createClient(name.trim(), color);
    setName('');
    setColor(COLORS[0]);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog">
        <div className="dialog-header">
          <h3>Add Client</h3>
          <button className="dialog-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-field">
              <label htmlFor="client-name">Client Name</label>
              <input
                id="client-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name..."
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
