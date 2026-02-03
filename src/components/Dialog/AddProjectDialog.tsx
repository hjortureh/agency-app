import { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import './Dialog.css';

interface AddProjectDialogProps {
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

export function AddProjectDialog({ isOpen, onClose }: AddProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');

  const { createClient, createProject, getActiveScenario } = useScheduleStore();
  const scenario = getActiveScenario();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    let clientId = selectedClientId;

    // If adding a new client, create it first
    if (clientMode === 'new') {
      if (!newClientName.trim()) return;
      const newClient = createClient(newClientName.trim());
      clientId = newClient.id;
    } else if (!clientId) {
      // No client selected
      return;
    }

    // Create the project with required color
    createProject(projectName.trim(), clientId, color);

    // Reset form
    setProjectName('');
    setColor(COLORS[0]);
    setClientMode('existing');
    setSelectedClientId('');
    setNewClientName('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isFormValid = projectName.trim() &&
    (clientMode === 'new' ? newClientName.trim() : selectedClientId);

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog">
        <div className="dialog-header">
          <h3>Add Project</h3>
          <button className="dialog-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            {/* Client Selection */}
            <div className="form-field">
              <label>Client</label>
              <div className="client-mode-toggle">
                <button
                  type="button"
                  className={clientMode === 'existing' ? 'active' : ''}
                  onClick={() => setClientMode('existing')}
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  className={clientMode === 'new' ? 'active' : ''}
                  onClick={() => setClientMode('new')}
                >
                  Add New
                </button>
              </div>

              {clientMode === 'existing' ? (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="client-select"
                >
                  <option value="">Select a client...</option>
                  {scenario.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Enter new client name..."
                  className="client-input"
                />
              )}
            </div>

            {/* Project Name */}
            <div className="form-field">
              <label htmlFor="project-name">Project Name</label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div className="form-field">
              <label>Project Color</label>
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
            <button type="submit" className="btn-primary" disabled={!isFormValid}>
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
