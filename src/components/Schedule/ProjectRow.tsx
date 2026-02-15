import { useState } from 'react';
import type { Project } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { PersonRow } from './PersonRow';
import { AddPersonToProjectDialog } from '../Dialog/AddPersonToProjectDialog';
import './ProjectRow.css';

interface ProjectRowProps {
  project: Project;
  clientName: string;
  dates: Date[];
  dayWidth: number;
}

export function ProjectRow({ project, clientName, dates, dayWidth }: ProjectRowProps) {
  const { expandedClients, toggleClientExpanded, getActiveScenario } = useScheduleStore();
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  const isExpanded = expandedClients.has(project.id);
  const scenario = getActiveScenario();

  // Get all people who have assignments for this project
  const peopleWithAssignments = scenario.people.filter(person =>
    scenario.assignments.some(assignment =>
      assignment.personId === person.id && assignment.projectId === project.id
    )
  );

  return (
    <div className="project-row-container">
      {/* Project header row */}
      <div className="project-row">
        <div className="project-info" onClick={() => toggleClientExpanded(project.id)}>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 2l4 4-4 4" />
            </svg>
          </span>
          <div className="project-details">
            <span className="project-client-label">{clientName}</span>
            <div className="project-title-row">
              <span
                className="project-color"
                style={{ backgroundColor: project.color }}
              />
              <span className="project-name">{project.name}</span>
            </div>
          </div>
        </div>
        <div
          className="project-timeline"
          style={{ width: dates.length * dayWidth }}
        >
          {/* Project-level timeline */}
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className="timeline-cell"
              style={{ width: dayWidth }}
            />
          ))}
        </div>
      </div>

      {/* Person rows (when expanded) */}
      {isExpanded && (
        <div className="people-container">
          {peopleWithAssignments.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              projectId={project.id}
              clientColor={project.color}
              dates={dates}
              dayWidth={dayWidth}
            />
          ))}
          <div className="add-person-row">
            <button
              className="project-add-person-btn"
              onClick={() => setIsAddPersonOpen(true)}
              title="Add person to project"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="add-person-label" onClick={() => setIsAddPersonOpen(true)}>Add person</span>
          </div>
        </div>
      )}

      <AddPersonToProjectDialog
        isOpen={isAddPersonOpen}
        onClose={() => {
          setIsAddPersonOpen(false);
          // Auto-expand the project row to show the newly added person
          if (!isExpanded) {
            toggleClientExpanded(project.id);
          }
        }}
        projectId={project.id}
      />
    </div>
  );
}
