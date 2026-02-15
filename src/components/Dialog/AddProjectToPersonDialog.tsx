import { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { format, addDays } from 'date-fns';
import './Dialog.css';

const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#10b981', '#06b6d4', '#f59e0b', '#ef4444',
];

interface AddProjectToPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
}

export function AddProjectToPersonDialog({ isOpen, onClose, personId }: AddProjectToPersonDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const oneWeekLater = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const [projectMode, setProjectMode] = useState<'existing' | 'new'>('existing');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [newProjectClientId, setNewProjectClientId] = useState('');

  const { createProject, createAssignment, getActiveScenario } = useScheduleStore();
  const scenario = getActiveScenario();

  if (!isOpen) return null;

  // Filter out projects already assigned to this person
  const assignedProjectIds = new Set(
    scenario.assignments
      .filter(a => a.personId === personId)
      .map(a => a.projectId)
  );
  const availableProjects = scenario.projects.filter(p => !assignedProjectIds.has(p.id));

  const isFormValid = projectMode === 'existing'
    ? false // existing mode uses direct click
    : newProjectName.trim() && newProjectClientId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newProject = createProject(
      newProjectName.trim(),
      newProjectClientId,
      newProjectColor
    );
    createAssignment(personId, newProject.id, today, oneWeekLater);

    // Reset form
    setProjectMode('existing');
    setNewProjectName('');
    setNewProjectColor(PROJECT_COLORS[0]);
    setNewProjectClientId('');
    onClose();
  };

  const handleSelectProject = (projectId: string) => {
    createAssignment(personId, projectId, today, oneWeekLater);
    setProjectMode('existing');
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
          <h3>Add Project to Person</h3>
          <button className="dialog-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 6l8 8M6 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-field">
            <div className="client-mode-toggle">
              <button
                type="button"
                className={projectMode === 'existing' ? 'active' : ''}
                onClick={() => setProjectMode('existing')}
              >
                Select Existing
              </button>
              <button
                type="button"
                className={projectMode === 'new' ? 'active' : ''}
                onClick={() => setProjectMode('new')}
              >
                Add New
              </button>
            </div>

            {projectMode === 'existing' ? (
              <div className="person-list">
                {availableProjects.length === 0 ? (
                  <div className="person-list-empty">No available projects</div>
                ) : (
                  availableProjects.map((project) => {
                    const client = scenario.clients.find(c => c.id === project.clientId);
                    return (
                      <button
                        key={project.id}
                        type="button"
                        className="person-list-item"
                        onClick={() => handleSelectProject(project.id)}
                      >
                        <span
                          className="project-list-color"
                          style={{
                            backgroundColor: project.color,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            flexShrink: 0,
                            display: 'flex',
                          }}
                        />
                        <div className="person-list-details">
                          <span className="person-list-name">{project.name}</span>
                          {client && <span className="person-list-role">{client.name}</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="new-person-fields">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    className="client-input"
                    autoFocus
                  />
                  <select
                    value={newProjectClientId}
                    onChange={(e) => setNewProjectClientId(e.target.value)}
                    className="client-select"
                  >
                    <option value="">Select client...</option>
                    {scenario.clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6, display: 'block' }}>Color</label>
                    <div className="color-picker">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${newProjectColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewProjectColor(color)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
