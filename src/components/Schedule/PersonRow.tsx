import type { Person } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { TimelineBar } from './TimelineBar';
import './PersonRow.css';

interface PersonRowProps {
  person: Person;
  clientColor: string;
  dates: Date[];
  dayWidth: number;
}

export function PersonRow({ person, clientColor, dates, dayWidth }: PersonRowProps) {
  const { getPersonAssignments, getProjectById } = useScheduleStore();

  const assignments = getPersonAssignments(person.id);

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
