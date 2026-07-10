import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sun, 
  Moon, 
  ArrowRight, 
  Lock, 
  AlertCircle, 
  Briefcase, 
  Code, 
  User, 
  TrendingUp 
} from 'lucide-react';

// --- Date Helpers ---

// Get current date string in local timezone (YYYY-MM-DD)
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate date offset (returns YYYY-MM-DD)
const getOffsetDateString = (dateStr, offset) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formats date nicely: "Today, Jul 11" or "Yesterday, Jul 10" or "Saturday, Jul 11, 2026"
const formatDateDisplay = (dateStr) => {
  const today = getTodayDateString();
  const yesterday = getOffsetDateString(today, -1);
  const tomorrow = getOffsetDateString(today, 1);

  const d = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const yearOptions = { year: 'numeric' };
  
  let formatted = d.toLocaleDateString('en-US', options);
  if (d.getFullYear() !== new Date().getFullYear()) {
    formatted += `, ${d.toLocaleDateString('en-US', yearOptions)}`;
  }

  if (dateStr === today) {
    return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (dateStr === yesterday) {
    return `Yesterday, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (dateStr === tomorrow) {
    return `Tomorrow, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return formatted;
};

function App() {
  const todayStr = getTodayDateString();

  // --- Core States ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('auratrack_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [inputText, setInputText] = useState('');
  const [inputCategory, setInputCategory] = useState('DSA');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('auratrack_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // --- Effects ---

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('auratrack_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync theme to document element and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auratrack_theme', theme);
  }, [theme]);

  // --- Interaction Flags ---
  const isToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;
  const isFuture = selectedDate > todayStr;

  // --- Actions ---

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      category: inputCategory,
      isCompleted: false,
      dateCreated: selectedDate,
      dateCompleted: null,
      wasShifted: false,
      shiftedFromDate: null,
      activeDate: selectedDate // Custom field for easier date mapping
    };

    setTasks(prev => [newTask, ...prev]);
    setInputText('');
  };

  const handleToggleComplete = (id) => {
    if (!isToday) return; // Only active on Today
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompletedState = !task.isCompleted;
        return {
          ...task,
          isCompleted: nextCompletedState,
          dateCompleted: nextCompletedState ? todayStr : null
        };
      }
      return task;
    }));
  };

  const handlePostponeTask = (id) => {
    if (!isToday) return; // Only active on Today
    const tomorrowStr = getOffsetDateString(selectedDate, 1);

    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          activeDate: tomorrowStr,
          wasShifted: true,
          shiftedFromDate: selectedDate
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (id) => {
    if (!isToday) return; // Only active on Today
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Date Navigation ---
  const handlePrevDay = () => {
    setSelectedDate(prev => getOffsetDateString(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => getOffsetDateString(prev, 1));
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
  };

  // --- Task Filtering & Mapping for Selected Date ---
  
  // Filter tasks belonging to selected date:
  // 1. Task is active on selectedDate: task.activeDate === selectedDate
  // 2. Task was shifted from selectedDate: task.shiftedFromDate === selectedDate (to show it as postponed on its original day)
  const dayTasks = tasks.filter(task => 
    task.activeDate === selectedDate || 
    (task.shiftedFromDate === selectedDate && task.wasShifted)
  );

  // Apply category filtering
  const filteredTasks = dayTasks.filter(task => {
    if (filterCategory === 'All') return true;
    return task.category === filterCategory;
  });

  // --- Statistics Calculation ---
  // A task is considered scheduled for D if its activeDate is D OR if it was postponed away from D.
  const completedCount = dayTasks.filter(t => t.isCompleted && t.dateCompleted === selectedDate).length;
  const postponedCount = dayTasks.filter(t => t.wasShifted && t.shiftedFromDate === selectedDate).length;
  const totalCount = dayTasks.length;
  const pendingCount = totalCount - completedCount - postponedCount;

  const completionPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  // Circle Progress calculations
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  // Category counts for filter chips
  const getCategoryCount = (cat) => {
    if (cat === 'All') return dayTasks.length;
    return dayTasks.filter(t => t.category === cat).length;
  };

  return (
    <div className="app-container">
      
      {/* Top Header & Navigation Bar */}
      <header className="glass-panel nav-bar">
        <div className="date-display">
          <span className="date-subtitle">
            {isToday ? "Today's Log" : isPast ? "History Log" : "Planning Log"}
          </span>
          <h1 className="date-title">{formatDateDisplay(selectedDate)}</h1>
        </div>
        
        <div className="controls-right">
          <button 
            className="icon-btn" 
            onClick={handlePrevDay} 
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="date-picker-wrapper">
            <input 
              type="date" 
              className="custom-date-input" 
              value={selectedDate}
              onChange={handleDateChange}
              title="Select Date"
            />
          </div>

          <button 
            className="icon-btn" 
            onClick={handleNextDay} 
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button 
              className="icon-btn" 
              onClick={handleJumpToToday} 
              title="Jump to Today"
            >
              <Calendar size={18} />
            </button>
          )}

          <button 
            className="icon-btn theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Review / Planning Mode Banner */}
      {!isToday && (
        <div className="review-mode-banner">
          {isPast ? (
            <>
              <Lock size={16} />
              <span>Review Mode: Past dates are read-only. Viewing historical entries.</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>Planning Mode: Future dates are read-only. Viewing scheduled items.</span>
            </>
          )}
        </div>
      )}

      {/* Progress Dashboard */}
      <section className="glass-panel dashboard-stats">
        <div className="stats-text">
          <h2 className="stats-headline">
            {totalCount === 0 
              ? "No tasks scheduled for today" 
              : completionPercentage === 100 
                ? "Excellent! Daily Prep complete!" 
                : `${completionPercentage}% of target achieved`
            }
          </h2>
          <p className="stats-subline">
            {totalCount > 0 ? (
              <>
                <strong>{completedCount}</strong> completed
                {postponedCount > 0 && <> • <strong>{postponedCount}</strong> postponed</>}
                {pendingCount > 0 && <> • <strong>{pendingCount}</strong> pending</>}
              </>
            ) : (
              "Plan tasks ahead to secure your preparation."
            )}
          </p>
        </div>
        
        <div className="progress-ring-container">
          <svg width="64" height="64">
            <circle
              stroke="var(--border-color)"
              strokeWidth="4.5"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            <circle
              className="progress-ring-circle"
              stroke="var(--accent)"
              strokeWidth="4.5"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="progress-ring-percentage">{completionPercentage}%</span>
        </div>
      </section>

      {/* Task Input Area (Today Only) */}
      {isToday && (
        <section className="glass-panel">
          <form className="task-form" onSubmit={handleAddTask}>
            <input
              type="text"
              className="task-input"
              placeholder="What DSA, Placement cell, or Personal task is next?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
            />
            
            <select
              className="task-select"
              value={inputCategory}
              onChange={(e) => setInputCategory(e.target.value)}
            >
              <option value="DSA">DSA</option>
              <option value="Placement Cell">Placement Cell</option>
              <option value="Personal">Personal</option>
            </select>
            
            <button type="submit" className="btn-primary">
              <Plus size={18} />
              <span>Add</span>
            </button>
          </form>
        </section>
      )}

      {/* Filter Category Chips Row */}
      <section className="filters-row">
        <button 
          className={`filter-chip ${filterCategory === 'All' ? 'active' : ''}`}
          onClick={() => setFilterCategory('All')}
        >
          <span>All</span>
          <span style={{opacity: 0.6}}>{getCategoryCount('All')}</span>
        </button>
        <button 
          className={`filter-chip ${filterCategory === 'DSA' ? 'active' : ''}`}
          onClick={() => setFilterCategory('DSA')}
        >
          <Code size={13} />
          <span>DSA</span>
          <span style={{opacity: 0.6}}>{getCategoryCount('DSA')}</span>
        </button>
        <button 
          className={`filter-chip ${filterCategory === 'Placement Cell' ? 'active' : ''}`}
          onClick={() => setFilterCategory('Placement Cell')}
        >
          <Briefcase size={13} />
          <span>Placement Cell</span>
          <span style={{opacity: 0.6}}>{getCategoryCount('Placement Cell')}</span>
        </button>
        <button 
          className={`filter-chip ${filterCategory === 'Personal' ? 'active' : ''}`}
          onClick={() => setFilterCategory('Personal')}
        >
          <User size={13} />
          <span>Personal</span>
          <span style={{opacity: 0.6}}>{getCategoryCount('Personal')}</span>
        </button>
      </section>

      {/* Tasks List Log */}
      <main className="glass-panel" style={{ minHeight: '220px' }}>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={48} className="empty-state-icon" />
            <p className="empty-state-text">
              {filterCategory === 'All' 
                ? "No tasks logged for this day." 
                : `No ${filterCategory} tasks found for this day.`
              }
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map(task => {
              // Determine status styles
              const isPostponedOnThisDay = task.wasShifted && task.shiftedFromDate === selectedDate;
              const isCompletedOnThisDay = task.isCompleted && task.dateCompleted === selectedDate;
              const isMissedOnThisDay = isPast && !task.isCompleted && task.activeDate === selectedDate;

              let itemClass = '';
              if (isCompletedOnThisDay) itemClass = 'completed';
              else if (isPostponedOnThisDay) itemClass = 'postponed';
              else if (isMissedOnThisDay) itemClass = 'missed';

              return (
                <li 
                  key={task.id} 
                  className={`task-item ${itemClass} ${!isToday ? 'readonly' : ''}`}
                >
                  <div className="task-item-left">
                    {/* Custom Checkbox (disabled on past/future logs, or if task was postponed from this date) */}
                    <label className="custom-checkbox-wrapper">
                      <input
                        type="checkbox"
                        className="custom-checkbox-input"
                        checked={isCompletedOnThisDay}
                        disabled={!isToday || isPostponedOnThisDay}
                        onChange={() => handleToggleComplete(task.id)}
                      />
                      <span className="custom-checkbox-box">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    </label>
                    
                    <div className="task-content-wrapper">
                      <span className="task-label">{task.text}</span>
                      
                      {/* Sub-label metadata depending on state */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        {/* Category Tag */}
                        <span className={`category-badge ${task.category.toLowerCase().replace(' ', '-')}`}>
                          {task.category}
                        </span>

                        {/* Postponed indicator (from original date) */}
                        {isPostponedOnThisDay && (
                          <span className="postponed-meta">
                            <ArrowRight size={12} />
                            Postponed to {formatDateDisplay(task.activeDate)}
                          </span>
                        )}

                        {/* Carried over indicator (on target date) */}
                        {task.wasShifted && task.activeDate === selectedDate && (
                          <span className="postponed-meta" style={{color: 'var(--accent)'}}>
                            Carried over from {formatDateDisplay(task.shiftedFromDate)}
                          </span>
                        )}

                        {/* Missed / Incomplete in past logs */}
                        {isMissedOnThisDay && (
                          <span className="missed-badge">
                            Incomplete / Missed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only active on Today's logs and not on tasks that have been postponed) */}
                  {isToday && !isPostponedOnThisDay && (
                    <div className="task-actions">
                      {!isCompletedOnThisDay && (
                        <button
                          className="action-btn btn-postpone"
                          onClick={() => handlePostponeTask(task.id)}
                          title="Postpone to Tomorrow"
                        >
                          <ArrowRight size={16} />
                        </button>
                      )}
                      
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="app-footer">
        <span>AuraTrack Daily Tracker</span>
        <span>•</span>
        <span>Designed for Engineering Excellence</span>
      </footer>

    </div>
  );
}

export default App;
