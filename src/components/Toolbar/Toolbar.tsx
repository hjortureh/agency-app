import { useState } from 'react';
import { format } from 'date-fns';
import { useScheduleStore } from '../../store/scheduleStore';
import { AddClientDialog } from '../Dialog/AddClientDialog';
import './Toolbar.css';

export function Toolbar() {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const {
    mainScenario,
    currentScenario,
    activeScenarioId,
    setActiveScenario,
    mergeToMain,
    discardCurrentScenario,
    viewStartDate,
    navigateDays,
    setViewStartDate,
  } = useScheduleStore();

  const isViewingMain = activeScenarioId === mainScenario.id;
  const hasChanges = JSON.stringify(currentScenario.assignments) !== JSON.stringify(mainScenario.assignments) ||
                    JSON.stringify(currentScenario.clients) !== JSON.stringify(mainScenario.clients) ||
                    JSON.stringify(currentScenario.people) !== JSON.stringify(mainScenario.people) ||
                    JSON.stringify(currentScenario.projects) !== JSON.stringify(mainScenario.projects);

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          {/* Scenario Toggle */}
          <div className="scenario-toggle">
            <button
              className={`toggle-btn ${isViewingMain ? 'active' : ''}`}
              onClick={() => setActiveScenario(mainScenario.id)}
            >
              <span className="toggle-icon main" />
              Main
            </button>
            <button
              className={`toggle-btn ${!isViewingMain ? 'active' : ''}`}
              onClick={() => setActiveScenario(currentScenario.id)}
            >
              <span className="toggle-icon draft" />
              Draft
              {hasChanges && <span className="change-indicator" />}
            </button>
          </div>

          {/* Merge/Discard buttons when viewing draft with changes */}
          {!isViewingMain && hasChanges && (
            <div className="scenario-actions">
              <button className="action-btn merge" onClick={mergeToMain}>
                Merge to Main
              </button>
              <button className="action-btn discard" onClick={discardCurrentScenario}>
                Discard
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-center">
          {/* Date Navigation */}
          <div className="date-nav">
            <button className="nav-btn" onClick={() => navigateDays(-7)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10 12L6 8l4-4" />
              </svg>
            </button>
            <button
              className="today-btn"
              onClick={() => setViewStartDate(new Date())}
            >
              Today
            </button>
            <button className="nav-btn" onClick={() => navigateDays(7)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
          <span className="date-display">
            {format(viewStartDate, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="toolbar-right">
          <button
            className="icon-btn"
            title="Add client"
            onClick={() => setIsAddClientOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <AddClientDialog
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />
    </>
  );
}
