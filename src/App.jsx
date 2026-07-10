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
    const saved = localStorage.getItem('preplog_tasks') || localStorage.getItem('auratrack_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const savedCats = localStorage.getItem('preplog_categories') || localStorage.getItem('auratrack_categories');
    return savedCats ? JSON.parse(savedCats) : ['DSA', 'Placement Cell', 'Personal'];
  });
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentTab, setCurrentTab] = useState('home');
  const [statusFilter, setStatusFilter] = useState('Todo');
  
  // Modal configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState('DSA');
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('preplog_theme') || localStorage.getItem('auratrack_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // --- Effects ---

  // Sync tasks
  useEffect(() => {
    localStorage.setItem('preplog_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync categories
  useEffect(() => {
    localStorage.setItem('preplog_categories', JSON.stringify(categories));
  }, [categories]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('preplog_theme', theme);
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
      dateCreated: todayStr, // Physically created today
      dateCompleted: null,
      wasShifted: false,
      shiftedFromDate: null,
      activeDate: selectedDate // Scheduled active date (could be Today or Future date)
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddCategory = (name) => {
    if (categories.includes(name)) return;
    setCategories(prev => [...prev, name]);
  };

  const handleToggleComplete = (id) => {
    if (!isToday) return; // Completion toggle only allowed when selectedDate is Today
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        // Ticking is restricted to the scheduled day only
        if (task.activeDate !== todayStr) return task;
        
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
    if (!isToday) return; // Postpone only allowed when selectedDate is Today
    const tomorrowStr = getOffsetDateString(selectedDate, 1);
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        // Postponing restricted to today's active tasks only
        if (task.activeDate !== todayStr) return task;

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
    if (!isToday) return; // Deleting tasks on the main list only allowed on Today view
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Trigger modal launch with pre-selected category
  const openAddTaskModal = (categoryName) => {
    setModalDefaultCategory(categoryName);
    setIsModalOpen(true);
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
                  <span>Planning Mode: Assign tasks below. Ticking is disabled until the day arrives.</span>
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
                  "Add items via the plus (+) button next to each category."
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
            categories={categories}
            handleAddCategory={handleAddCategory}
            selectedDate={selectedDate}
            todayStr={todayStr}
            isToday={isToday}
            isPast={isPast}
            handleToggleComplete={handleToggleComplete}
            handlePostponeTask={handlePostponeTask}
            handleDeleteTask={handleDeleteTask}
            formatDateDisplay={formatDateDisplay}
            theme={theme}
            openAddTaskModal={openAddTaskModal}
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
      />

      {/* Slide-up Task Creation Dialog Modal Overlay */}
      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleAddTask={handleAddTask}
        categories={categories}
        defaultCategory={modalDefaultCategory}
      />
    </div>
  );
}
