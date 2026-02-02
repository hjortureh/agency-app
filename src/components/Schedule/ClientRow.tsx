import type { Client } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { PersonRow } from './PersonRow';
import './ClientRow.css';

interface ClientRowProps {
  client: Client;
  dates: Date[];
  dayWidth: number;
}

export function ClientRow({ client, dates, dayWidth }: ClientRowProps) {
  const { expandedClients, toggleClientExpanded, getClientPeople } = useScheduleStore();

  const isExpanded = expandedClients.has(client.id);
  const people = getClientPeople(client.id);

  return (
    <div className="client-row-container">
      {/* Client header row */}
      <div className="client-row">
        <div className="client-info" onClick={() => toggleClientExpanded(client.id)}>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 2l4 4-4 4" />
            </svg>
          </span>
          <span className="client-name">{client.name}</span>
          <span className="client-count">{people.length}</span>
        </div>
        <div
          className="client-timeline"
          style={{ width: dates.length * dayWidth }}
        >
          {/* Client-level timeline (optional: could show aggregate) */}
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
          {people.length === 0 ? (
            <div className="no-people">
              <span>No team members</span>
            </div>
          ) : (
            people.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                clientColor={client.color || '#6b7280'}
                dates={dates}
                dayWidth={dayWidth}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
