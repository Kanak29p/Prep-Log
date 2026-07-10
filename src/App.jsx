import React, { useState, useEffect } from 'react';
import { Sun, Moon, Lock, AlertCircle } from 'lucide-react';

// Import modular components
import CalendarStrip from './components/CalendarStrip';
import StatusFilters from './components/StatusFilters';
import TaskAccordions from './components/TaskAccordions';
import AddModal from './components/AddModal';
import BottomNav from './components/BottomNav';
import InsightsView from './components/InsightsView';
import ProfileView from './components/ProfileView';

// --- Date Helpers ---

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOffsetDateString = (dateStr, offset) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

export default function App() {
  const todayStr = getTodayDateString();

  // --- States ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('auratrack_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentTab, setCurrentTab] = useState('home');
  const [statusFilter, setStatusFilter] = useState('Todo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('auratrack_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // --- Effects ---

  // Sync tasks
  useEffect(() => {
    localStorage.setItem('auratrack_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auratrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Interaction States ---
  const isToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;
  const isFuture = selectedDate > todayStr;

  // --- Mutation Actions ---

  const handleAddTask = (text, category) => {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      category,
      isCompleted: false,
      dateCreated: selectedDate, // Will be todayStr as modal add button is only active when isToday
      dateCompleted: null,
      wasShifted: false,
      shiftedFromDate: null,
      activeDate: selectedDate
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleComplete = (id) => {
    if (!isToday) return;
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextState = !task.isCompleted;
        return {
          ...task,
          isCompleted: nextState,
          dateCompleted: nextState ? todayStr : null
        };
      }
      return task;
    }));
  };

  const handlePostponeTask = (id) => {
    if (!isToday) return;
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
    if (!isToday) return;
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // --- Filtering & Stat Calculations for Current Date ---
  const dayTasks = tasks.filter(task => 
    task.activeDate === selectedDate || 
    (task.shiftedFromDate === selectedDate && task.wasShifted)
  );

  // Filter tasks based on Todo, Completed, Pending status selection
  const filteredTasks = dayTasks.filter(task => {
    if (statusFilter === 'Todo') {
      return !task.isCompleted && task.activeDate === selectedDate && task.shiftedFromDate !== selectedDate;
    }
    if (statusFilter === 'Completed') {
      return task.isCompleted && task.dateCompleted === selectedDate;
    }
    if (statusFilter === 'Pending') {
      return (task.wasShifted && task.shiftedFromDate === selectedDate) || 
             (isPast && !task.isCompleted && task.activeDate === selectedDate);
    }
    return true;
  });

  // Calculate day completion percentages for the stats card
  const completedCount = dayTasks.filter(t => t.isCompleted && t.dateCompleted === selectedDate).length;
  const postponedCount = dayTasks.filter(t => t.wasShifted && t.shiftedFromDate === selectedDate).length;
  const totalCount = dayTasks.length;
  const pendingCount = totalCount - completedCount - postponedCount;

  const dayPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  // Circle Progress configuration
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dayPercentage / 100) * circumference;

  return (
    <div className="app-layout">
      {/* Top Welcome Title Grid */}
      <header className="welcome-header">
        <div className="welcome-info">
          <h1 className="welcome-title">Hey, User! 👋</h1>
          <span className="welcome-sub">Let's make progress today!</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn theme-toggle" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Conditionally Render Tabs */}
      {currentTab === 'home' && (
        <>
          {/* Calendar Strip Row */}
          <CalendarStrip 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayStr={todayStr}
            getOffsetDateString={getOffsetDateString}
          />

          {/* Banner alert if looking at past / future read-only archives */}
          {!isToday && (
            <div className={`view-warning-banner ${isFuture ? 'future' : 'past'}`}>
              {isPast ? (
                <>
                  <Lock size={16} />
                  <span>Review Mode: Past logs are read-only.</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Planning Mode: Future logs are read-only.</span>
                </>
              )}
            </div>
          )}

          {/* Status Tab Pills */}
          <StatusFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dayTasks={dayTasks}
            selectedDate={selectedDate}
            isPast={isPast}
          />

          {/* Daily Completion Dashboard Stats Card */}
          <section className="card-panel dashboard-card">
            <div className="dash-info">
              <h2 className="dash-title">
                {totalCount === 0 
                  ? "No tasks scheduled for today" 
                  : dayPercentage === 100 
                    ? "Fantastic! Day is fully completed!" 
                    : `${dayPercentage}% of target achieved`
                }
              </h2>
              <span className="dash-desc">
                {totalCount > 0 ? (
                  <>
                    <strong>{completedCount}</strong> completed
                    {postponedCount > 0 && <> • <strong>{postponedCount}</strong> postponed</>}
                    {pendingCount > 0 && <> • <strong>{pendingCount}</strong> pending</>}
                  </>
                ) : (
                  "Add items via the floating plus (+) button below."
                )}
              </span>
            </div>

            <div className="circular-progress-wrap">
              <svg width="58" height="58">
                <circle
                  stroke="var(--border-color)"
                  strokeWidth="4"
                  fill="transparent"
                  r={radius}
                  cx="29"
                  cy="29"
                />
                <circle
                  className="progress-circle-bar"
                  stroke="var(--accent)"
                  strokeWidth="4"
                  fill="transparent"
                  r={radius}
                  cx="29"
                  cy="29"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="progress-percentage-label">{dayPercentage}%</span>
            </div>
          </section>

          {/* Categorized collapsible accordion task lists */}
          <TaskAccordions
            tasks={filteredTasks}
            selectedDate={selectedDate}
            isToday={isToday}
            isPast={isPast}
            handleToggleComplete={handleToggleComplete}
            handlePostponeTask={handlePostponeTask}
            handleDeleteTask={handleDeleteTask}
            formatDateDisplay={formatDateDisplay}
          />
        </>
      )}

      {currentTab === 'insights' && (
        <InsightsView tasks={tasks} todayStr={todayStr} />
      )}

      {currentTab === 'profile' && (
        <ProfileView tasks={tasks} />
      )}

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setIsModalOpen={setIsModalOpen}
        isToday={isToday}
      />

      {/* Slide-up Task Creation Dialog Modal Overlay */}
      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleAddTask={handleAddTask}
      />
    </div>
  );
}
