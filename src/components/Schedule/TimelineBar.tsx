import { useState, useEffect } from 'react';
import { differenceInDays, startOfDay, addDays, format } from 'date-fns';
import type { Assignment, Project } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import './TimelineBar.css';

interface TimelineBarProps {
  assignment: Assignment;
  project: Project | undefined;
  dates: Date[];
  dayWidth: number;
}

type DragMode = 'move' | 'resize-start' | 'resize-end' | null;

export function TimelineBar({ assignment, project, dates, dayWidth }: TimelineBarProps) {
  const { moveAssignment, resizeAssignment } = useScheduleStore();

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, startDate: '', endDate: '' });

  // Calculate position and width
  const viewStart = startOfDay(dates[0]);
  const assignmentStart = startOfDay(new Date(assignment.startDate));
  const assignmentEnd = startOfDay(new Date(assignment.endDate));

  const startOffset = differenceInDays(assignmentStart, viewStart);
  const duration = differenceInDays(assignmentEnd, assignmentStart) + 1;

  // Check if assignment is visible in current view
  const viewEnd = dates[dates.length - 1];
  if (assignmentEnd < viewStart || assignmentStart > viewEnd) {
    return null;
  }

  const left = Math.max(0, startOffset) * dayWidth;
  const visibleStart = Math.max(0, startOffset);
  const visibleEnd = Math.min(dates.length - 1, startOffset + duration - 1);
  const width = (visibleEnd - visibleStart + 1) * dayWidth - 4;

  const color = project?.color || '#6b7280';

  const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    setDragMode(mode);
    setDragStart({
      x: e.clientX,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
    });
  };

  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const daysDelta = Math.round(deltaX / dayWidth);

      if (daysDelta === 0) return;

      const origStart = new Date(dragStart.startDate);
      const origEnd = new Date(dragStart.endDate);

      if (dragMode === 'move') {
        const newStart = addDays(origStart, daysDelta);
        moveAssignment(assignment.id, format(newStart, 'yyyy-MM-dd'));
      } else if (dragMode === 'resize-start') {
        const newStart = addDays(origStart, daysDelta);
        if (newStart <= origEnd) {
          resizeAssignment(
            assignment.id,
            format(newStart, 'yyyy-MM-dd'),
            assignment.endDate
          );
        }
      } else if (dragMode === 'resize-end') {
        const newEnd = addDays(origEnd, daysDelta);
        if (newEnd >= origStart) {
          resizeAssignment(
            assignment.id,
            assignment.startDate,
            format(newEnd, 'yyyy-MM-dd')
          );
        }
      }
    };

    const handleMouseUp = () => {
      setDragMode(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragMode, dragStart, dayWidth, assignment, moveAssignment, resizeAssignment]);

  return (
    <div
      className={`timeline-bar ${dragMode ? 'dragging' : ''}`}
      style={{
        left,
        width: Math.max(width, dayWidth - 4),
        backgroundColor: color,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Resize handle - start */}
      <div
        className="resize-handle start"
        onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
      />

      {/* Content */}
      <div className="bar-content" />

      {/* Resize handle - end */}
      <div
        className="resize-handle end"
        onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
      />
    </div>
  );
}
