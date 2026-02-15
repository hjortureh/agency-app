import type { Project } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { TimelineBar } from './TimelineBar';
import './ProjectSubRow.css';

interface ProjectSubRowProps {
  project: Project;
  clientName: string;
  personId: string;
  dates: Date[];
  dayWidth: number;
}

export function ProjectSubRow({ project, clientName, personId, dates, dayWidth }: ProjectSubRowProps) {
  const { getPersonAssignments, getProjectById } = useScheduleStore();

  const assignments = getPersonAssignments(personId).filter(a => a.projectId === project.id);

  return (
    <div className="project-sub-row">
      <div className="project-sub-info">
        <span className="project-sub-indent" />
        <div className="project-sub-details">
          <span className="project-sub-client-label">{clientName}</span>
          <div className="project-sub-title-row">
            <span
              className="project-sub-color"
              style={{ backgroundColor: project.color }}
            />
            <span className="project-sub-name">{project.name}</span>
          </div>
        </div>
      </div>
      <div
        className="project-sub-timeline"
        style={{ width: dates.length * dayWidth }}
      >
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className="timeline-cell"
            style={{ width: dayWidth }}
          />
        ))}

        {assignments.map((assignment) => {
          const proj = getProjectById(assignment.projectId);
          return (
            <TimelineBar
              key={assignment.id}
              assignment={assignment}
              project={proj}
              dates={dates}
              dayWidth={dayWidth}
            />
          );
        })}
      </div>
    </div>
  );
}
