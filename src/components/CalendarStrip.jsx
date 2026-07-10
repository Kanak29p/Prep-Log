import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const getDaysOfWeek = (dateStr) => {
  const current = new Date(dateStr + 'T00:00:00');
  const day = current.getDay(); // 0 is Sunday, 1 is Monday...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${dateVal}`;
    
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
    const dateNum = d.getDate();
    days.push({ dateStr: formatted, weekday, dateNum });
  }
  return days;
};

export default function CalendarStrip({ selectedDate, setSelectedDate, todayStr, getOffsetDateString }) {
  const days = getDaysOfWeek(selectedDate);

  const handlePrevWeek = () => {
    setSelectedDate(prev => getOffsetDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(prev => getOffsetDateString(prev, 7));
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  return (
    <div className="calendar-strip-container">
      <button 
        className="icon-btn" 
        onClick={handlePrevWeek} 
        title="Previous Week"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="calendar-scroll-area">
        {days.map((day) => {
          const isActive = day.dateStr === selectedDate;
          const isToday = day.dateStr === todayStr;
          
          return (
            <div
              key={day.dateStr}
              className={`calendar-day-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedDate(day.dateStr)}
            >
              <span className="day-name">{day.weekday}</span>
              <span className="day-number">{day.dateNum}</span>
              {isToday && <span className="today-dot"></span>}
            </div>
          );
        })}
      </div>

      <button 
        className="icon-btn" 
        onClick={handleNextWeek} 
        title="Next Week"
      >
        <ChevronRight size={16} />
      </button>

      <div className="date-picker-trigger">
        <button className="icon-btn" title="Choose Specific Date">
          <Calendar size={16} />
        </button>
        <input 
          type="date" 
          className="hidden-date-picker" 
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
}
