import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { useScheduleStore } from '../../store/scheduleStore';
import { ProjectRow } from './ProjectRow';
import { DayHeader } from './DayHeader';
import './ScheduleView.css';

export function ScheduleView() {
  const {
    viewStartDate,
    daysToShow,
    getActiveScenario,
  } = useScheduleStore();

  const scenario = getActiveScenario();

  // Generate array of dates to display
  const dates = useMemo(() => {
    const start = startOfDay(viewStartDate);
    return Array.from({ length: daysToShow }, (_, i) => addDays(start, i));
  }, [viewStartDate, daysToShow]);

  // Calculate day width for positioning
  const dayWidth = 40; // pixels per day

  return (
    <div className="schedule-view">
      {/* Timeline header with dates */}
      <div className="schedule-header">
        <div className="schedule-header-left">
          <span className="header-label">Schedule</span>
        </div>
        <div className="schedule-header-timeline">
          <div className="days-container" style={{ width: dates.length * dayWidth }}>
            {dates.map((date) => (
              <DayHeader key={date.toISOString()} date={date} width={dayWidth} />
            ))}
          </div>
        </div>
      </div>

      {/* Project rows */}
      <div className="schedule-body">
        {scenario.projects.length === 0 ? (
          <div className="schedule-empty">
            <p>No projects yet</p>
            <p className="hint">
              Click the + button above to add a project
            </p>
          </div>
        ) : (
          scenario.projects.map((project) => {
            const client = scenario.clients.find(c => c.id === project.clientId);
            const clientName = client?.name || 'Unknown Client';
            return (
              <ProjectRow
                key={project.id}
                project={project}
                clientName={clientName}
                dates={dates}
                dayWidth={dayWidth}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
