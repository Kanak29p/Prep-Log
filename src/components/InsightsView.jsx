import React from 'react';

// Calculate consecutive days streak where at least one task was completed
const calculateStreak = (tasks, todayStr) => {
  const completionDates = new Set(
    tasks
      .filter(t => t.isCompleted && t.dateCompleted)
      .map(t => t.dateCompleted)
  );
  
  if (completionDates.size === 0) return 0;

  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let checkDate = new Date(todayStr + 'T00:00:00');
  let todayFormatted = formatDate(checkDate);
  let completedToday = completionDates.has(todayFormatted);

  // If nothing completed today, check if yesterday was completed to preserve streak
  if (!completedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
    let yesterdayFormatted = formatDate(checkDate);
    if (!completionDates.has(yesterdayFormatted)) {
      return 0; // Streak is 0
    }
  } else {
    // Start counting from today
    checkDate = new Date(todayStr + 'T00:00:00');
  }

  let streak = 0;
  // Count backwards consecutively
  while (true) {
    const formatted = formatDate(checkDate);
    if (completionDates.has(formatted)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export default function InsightsView({ tasks, todayStr }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const postponedTasks = tasks.filter(t => t.wasShifted).length;
  
  const overallCompletionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const streakCount = calculateStreak(tasks, todayStr);

  // Category specific calculations
  const getCategoryStats = (catName) => {
    const catTasks = tasks.filter(t => t.category === catName);
    const catCompleted = catTasks.filter(t => t.isCompleted).length;
    const catPercentage = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;
    return { total: catTasks.length, completed: catCompleted, percentage: catPercentage };
  };

  const dsaStats = getCategoryStats('DSA');
  const placementStats = getCategoryStats('Placement Cell');
  const personalStats = getCategoryStats('Personal');

  return (
    <div className="insights-layout animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, margin: '0.2rem 0' }}>
        Performance Analytics
      </h2>

      {/* Numerical Stats Grid */}
      <div className="insights-grid">
        <div className="stat-box">
          <span className="stat-val" style={{ color: 'var(--text-primary)' }}>{completedTasks}</span>
          <span className="stat-lbl">Tasks Done</span>
        </div>
        <div className="stat-box">
          <span className="stat-val" style={{ color: 'var(--accent)' }}>{streakCount} 🔥</span>
          <span className="stat-lbl">Active Streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-val" style={{ color: '#10B981' }}>{overallCompletionRate}%</span>
          <span className="stat-lbl">Success Rate</span>
        </div>
        <div className="stat-box">
          <span className="stat-val" style={{ color: '#F59E0B' }}>{postponedTasks}</span>
          <span className="stat-lbl">Postponed</span>
        </div>
      </div>

      {/* Category Distributions */}
      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          Category Progress
        </h3>

        <div className="dist-row">
          <div className="dist-meta">
            <span style={{ color: 'hsl(var(--dsa-color), 80%, 40%)' }}>💻 DSA Prep</span>
            <span>{dsaStats.completed}/{dsaStats.total} ({dsaStats.percentage}%)</span>
          </div>
          <div className="dist-bar-track">
            <div 
              className="dist-bar-fill" 
              style={{ width: `${dsaStats.percentage}%`, backgroundColor: 'hsl(var(--dsa-color), 80%, 50%)' }}
            ></div>
          </div>
        </div>

        <div className="dist-row">
          <div className="dist-meta">
            <span style={{ color: 'hsl(var(--placement-color), 95%, 35%)' }}>💼 Placement Cell</span>
            <span>{placementStats.completed}/{placementStats.total} ({placementStats.percentage}%)</span>
          </div>
          <div className="dist-bar-track">
            <div 
              className="dist-bar-fill" 
              style={{ width: `${placementStats.percentage}%`, backgroundColor: 'hsl(var(--placement-color), 95%, 45%)' }}
            ></div>
          </div>
        </div>

        <div className="dist-row">
          <div className="dist-meta">
            <span style={{ color: 'hsl(var(--personal-color), 75%, 30%)' }}>🌱 Personal Tasks</span>
            <span>{personalStats.completed}/{personalStats.total} ({personalStats.percentage}%)</span>
          </div>
          <div className="dist-bar-track">
            <div 
              className="dist-bar-fill" 
              style={{ width: `${personalStats.percentage}%`, backgroundColor: 'hsl(var(--personal-color), 75%, 40%)' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Completion Ring Banner */}
      <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, var(--accent-light), transparent)' }}>
        <div style={{ fontSize: '1.5rem' }}>🎯</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Preparation Milestone Target</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Complete 80% of your tasks this week to stay on track for placement mock calls.
          </span>
        </div>
      </div>
    </div>
  );
}
