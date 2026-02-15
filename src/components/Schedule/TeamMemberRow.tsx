import type { Person } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { ProjectSubRow } from './ProjectSubRow';
import './TeamMemberRow.css';

interface TeamMemberRowProps {
  person: Person;
  dates: Date[];
  dayWidth: number;
}

export function TeamMemberRow({ person, dates, dayWidth }: TeamMemberRowProps) {
  const { expandedPeople, togglePersonExpanded, getActiveScenario } = useScheduleStore();

  const isExpanded = expandedPeople.has(person.id);
  const scenario = getActiveScenario();

  // Get unique projects this person is assigned to
  const personAssignments = scenario.assignments.filter(a => a.personId === person.id);
  const projectIds = [...new Set(personAssignments.map(a => a.projectId))];
  const assignedProjects = projectIds
    .map(id => scenario.projects.find(p => p.id === id))
    .filter(Boolean) as typeof scenario.projects;

  return (
    <div className="team-member-row-container">
      <div className="team-member-row">
        <div className="team-member-info" onClick={() => togglePersonExpanded(person.id)}>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 2l4 4-4 4" />
            </svg>
          </span>
          <span className="team-member-avatar">
            {person.name.charAt(0)}
          </span>
          <div className="team-member-details">
            {person.role && <span className="team-member-role-label">{person.role}</span>}
            <span className="team-member-name">{person.name}</span>
          </div>
          <span className="team-member-count">{assignedProjects.length}</span>
        </div>
        <div
          className="team-member-timeline"
          style={{ width: dates.length * dayWidth }}
        >
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className="timeline-cell"
              style={{ width: dayWidth }}
            />
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="team-projects-container">
          {assignedProjects.length === 0 ? (
            <div className="no-projects">
              <span>No projects assigned</span>
            </div>
          ) : (
            assignedProjects.map((project) => {
              const client = scenario.clients.find(c => c.id === project.clientId);
              const clientName = client?.name || 'Unknown Client';
              return (
                <ProjectSubRow
                  key={project.id}
                  project={project}
                  clientName={clientName}
                  personId={person.id}
                  dates={dates}
                  dayWidth={dayWidth}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
