import type { Person } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { TimelineBar } from './TimelineBar';
import './PersonRow.css';

interface PersonRowProps {
  person: Person;
  clientColor: string;
  dates: Date[];
  dayWidth: number;
  projectId?: string; // Optional - filter assignments by project
}

export function PersonRow({ person, clientColor, dates, dayWidth, projectId }: PersonRowProps) {
  const { getPersonAssignments, getProjectById, deleteAssignment } = useScheduleStore();

  // Get all assignments for this person
  let assignments = getPersonAssignments(person.id);

  // If projectId is provided, filter to only show assignments for that project
  if (projectId) {
    assignments = assignments.filter(a => a.projectId === projectId);
  }

  return (
    <div className="person-row">
      <div className="person-info">
        <span className="person-indent" />
        <span className="person-avatar" style={{ borderColor: clientColor }}>
          {person.name.charAt(0)}
        </span>
        <div className="person-details">
          <span className="person-name">{person.name}</span>
          {person.role && <span className="person-role">{person.role}</span>}
        </div>
        {projectId && (
          <button
            className="person-remove-btn"
            onClick={() => assignments.forEach(a => deleteAssignment(a.id))}
            title="Remove from project"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 4l6 6M4 10l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <div
        className="person-timeline"
        style={{ width: dates.length * dayWidth }}
      >
        {/* Grid cells */}
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className="timeline-cell"
            style={{ width: dayWidth }}
          />
        ))}

        {/* Assignment bars */}
        {assignments.map((assignment) => {
          const project = getProjectById(assignment.projectId);
          return (
            <TimelineBar
              key={assignment.id}
              assignment={assignment}
              project={project}
              dates={dates}
              dayWidth={dayWidth}
            />
          );
        })}
      </div>
    </div>
  );
}
