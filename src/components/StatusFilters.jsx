import React from 'react';

export default function StatusFilters({ statusFilter, setStatusFilter, dayTasks, selectedDate, isPast }) {
  // Compute badge counts for status filters based on the task list
  const todoCount = dayTasks.filter(t => 
    !t.isCompleted && 
    t.activeDate === selectedDate && 
    t.shiftedFromDate !== selectedDate
  ).length;

  const completedCount = dayTasks.filter(t => 
    t.isCompleted && 
    t.dateCompleted === selectedDate
  ).length;

  const pendingCount = dayTasks.filter(t => 
    (t.wasShifted && t.shiftedFromDate === selectedDate) || 
    (isPast && !t.isCompleted && t.activeDate === selectedDate)
  ).length;

  return (
    <div className="status-filters">
      <button
        className={`status-pill ${statusFilter === 'Todo' ? 'active' : ''}`}
        onClick={() => setStatusFilter('Todo')}
      >
        <span>🔄 To do</span>
        <span className="status-count">{todoCount}</span>
      </button>

      <button
        className={`status-pill ${statusFilter === 'Completed' ? 'active' : ''}`}
        onClick={() => setStatusFilter('Completed')}
      >
        <span>✓ Completed</span>
        <span className="status-count">{completedCount}</span>
      </button>

      <button
        className={`status-pill ${statusFilter === 'Pending' ? 'active' : ''}`}
        onClick={() => setStatusFilter('Pending')}
      >
        <span>🕒 Pending</span>
        <span className="status-count">{pendingCount}</span>
      </button>
    </div>
  );
}
