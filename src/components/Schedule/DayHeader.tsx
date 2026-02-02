import { format, isToday, isWeekend, isFirstDayOfMonth } from 'date-fns';
import './DayHeader.css';

interface DayHeaderProps {
  date: Date;
  width: number;
}

export function DayHeader({ date, width }: DayHeaderProps) {
  const isCurrentDay = isToday(date);
  const isWeekendDay = isWeekend(date);
  const isMonthStart = isFirstDayOfMonth(date);

  return (
    <div
      className={`day-header ${isCurrentDay ? 'today' : ''} ${isWeekendDay ? 'weekend' : ''} ${isMonthStart ? 'month-start' : ''}`}
      style={{ width }}
    >
      {isMonthStart && (
        <div className="month-label">{format(date, 'MMM')}</div>
      )}
      <div className="day-number">{format(date, 'd')}</div>
      <div className="day-name">{format(date, 'EEE').charAt(0)}</div>
    </div>
  );
}
