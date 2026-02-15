import { useState } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { format, addDays } from 'date-fns';
import './Dialog.css';

interface AddPersonToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddPersonToProjectDialog({ isOpen, onClose, projectId }: AddPersonToProjectDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const oneWeekLater = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const [personMode, setPersonMode] = useState<'existing' | 'new'>('existing');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');

  const { createPerson, createAssignment, getActiveScenario } = useScheduleStore();
  const scenario = getActiveScenario();

  // Get the client from the project
  const project = scenario.projects.find(p => p.id === projectId);
  const clientId = project?.clientId ?? '';

  if (!isOpen) return null;

  // Filter out people already assigned to this project
  const assignedPersonIds = new Set(
    scenario.assignments
      .filter(a => a.projectId === projectId)
      .map(a => a.personId)
  );
  const availablePeople = scenario.people.filter(p => !assignedPersonIds.has(p.id));

  const isFormValid = personMode === 'existing'
    ? !!selectedPersonId
    : newPersonName.trim() && clientId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let personId = selectedPersonId;

    if (personMode === 'new') {
      const newPerson = createPerson(
        newPersonName.trim(),
        clientId,
        newPersonRole.trim() || undefined
      );
      personId = newPerson.id;
    }

    createAssignment(personId, projectId, today, oneWeekLater);

    // Reset form
    setPersonMode('existing');
    setSelectedPersonId('');
    setNewPersonName('');
    setNewPersonRole('');
    onClose();
  };

  const handleSelectPerson = (personId: string) => {
    // Directly add the person and close
    createAssignment(personId, projectId, today, oneWeekLater);
    setSelectedPersonId('');
    setPersonMode('existing');
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
          <h3>Add Person to Project</h3>
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
                className={personMode === 'existing' ? 'active' : ''}
                onClick={() => setPersonMode('existing')}
              >
                Select Existing
              </button>
              <button
                type="button"
                className={personMode === 'new' ? 'active' : ''}
                onClick={() => setPersonMode('new')}
              >
                Add New
              </button>
            </div>

            {personMode === 'existing' ? (
              <div className="person-list">
                {availablePeople.length === 0 ? (
                  <div className="person-list-empty">No available team members</div>
                ) : (
                  availablePeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className="person-list-item"
                      onClick={() => handleSelectPerson(person.id)}
                    >
                      <span className="person-list-avatar">
                        {person.name.charAt(0)}
                      </span>
                      <div className="person-list-details">
                        <span className="person-list-name">{person.name}</span>
                        {person.role && <span className="person-list-role">{person.role}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="new-person-fields">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Person name..."
                    className="client-input"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value)}
                    placeholder="Role (optional)..."
                    className="client-input"
                  />
                </div>
                <div className="dialog-footer">
                  <button type="button" className="btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={!isFormValid}>
                    Add Person
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
