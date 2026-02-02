import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { useScheduleStore } from '../../store/scheduleStore';
import { ClientRow } from './ClientRow';
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

      {/* Client rows */}
      <div className="schedule-body">
        {scenario.clients.length === 0 ? (
          <div className="schedule-empty">
            <p>No clients yet</p>
            <p className="hint">
              Use the chat to add clients, or click the + button above
            </p>
          </div>
        ) : (
          scenario.clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              dates={dates}
              dayWidth={dayWidth}
            />
          ))
        )}
      </div>
    </div>
  );
}
