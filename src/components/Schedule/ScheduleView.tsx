import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { useScheduleStore } from '../../store/scheduleStore';
import { ProjectRow } from './ProjectRow';
import { TeamMemberRow } from './TeamMemberRow';
import { DayHeader } from './DayHeader';
import './ScheduleView.css';

export function ScheduleView() {
  const {
    scheduleViewMode,
    setScheduleViewMode,
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

  // For team view: get all people (show all, not just those with assignments)
  const allPeople = scenario.people;

  return (
    <div className="schedule-view">
      {/* Timeline header with dates */}
      <div className="schedule-header">
        <div className="schedule-header-left">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${scheduleViewMode === 'project' ? 'active' : ''}`}
              onClick={() => setScheduleViewMode('project')}
            >
              Project
            </button>
            <button
              className={`view-toggle-btn ${scheduleViewMode === 'team' ? 'active' : ''}`}
              onClick={() => setScheduleViewMode('team')}
            >
              Team
            </button>
          </div>
        </div>
        <div className="schedule-header-timeline">
          <div className="days-container" style={{ width: dates.length * dayWidth }}>
            {dates.map((date) => (
              <DayHeader key={date.toISOString()} date={date} width={dayWidth} />
            ))}
          </div>
        </div>
      </div>

      {/* Schedule rows */}
      <div className="schedule-body">
        {scheduleViewMode === 'project' ? (
          scenario.projects.length === 0 ? (
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
          )
        ) : (
          allPeople.length === 0 ? (
            <div className="schedule-empty">
              <p>No team members yet</p>
              <p className="hint">
                Add people via the chat to see them here
              </p>
            </div>
          ) : (
            allPeople.map((person) => (
              <TeamMemberRow
                key={person.id}
                person={person}
                dates={dates}
                dayWidth={dayWidth}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}
