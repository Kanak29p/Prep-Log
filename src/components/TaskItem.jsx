import React from 'react';
import { ArrowRight, Trash2, Check } from 'lucide-react';

// Dynamic emoji parser based on text and category keywords
const getTaskEmoji = (text, category) => {
  const lower = text.toLowerCase();
  if (category === 'DSA') {
    if (lower.includes('leet') || lower.includes('code') || lower.includes('solve')) return '💻';
    if (lower.includes('graph') || lower.includes('tree') || lower.includes('dp') || lower.includes('array')) return '🧠';
    if (lower.includes('sort') || lower.includes('search') || lower.includes('find')) return '🔍';
    return '⚡';
  }
  if (category === 'Placement Cell') {
    if (lower.includes('resume') || lower.includes('cv') || lower.includes('profile')) return '📄';
    if (lower.includes('mock') || lower.includes('interview') || lower.includes('talk')) return '🤝';
    if (lower.includes('apply') || lower.includes('job') || lower.includes('portal') || lower.includes('form')) return '📮';
    return '💼';
  }
  if (category === 'Personal') {
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('run') || lower.includes('play')) return '🏋️‍♂️';
    if (lower.includes('buy') || lower.includes('shop') || lower.includes('get')) return '🛒';
    if (lower.includes('read') || lower.includes('book') || lower.includes('study')) return '📚';
    if (lower.includes('call') || lower.includes('meet') || lower.includes('talk')) return '📞';
    return '🌱';
  }
  return '✨';
};

// Deterministic HSL hue generation based on string name
const getCategoryHue = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
};

// Generate badge styles dynamically for default or custom categories
const getBadgeStyle = (category, theme) => {
  let hue;
  if (category === 'DSA') hue = 262;
  else if (category === 'Placement Cell') hue = 32;
  else if (category === 'Personal') hue = 162;
  else hue = getCategoryHue(category);

  const isDark = theme === 'dark';
  if (isDark) {
    return {
      backgroundColor: `hsla(${hue}, 80%, 65%, 0.12)`,
      color: `hsl(${hue}, 85%, 70%)`,
      borderColor: `hsla(${hue}, 80%, 65%, 0.25)`,
      borderWidth: '1px',
      borderStyle: 'solid'
    };
  } else {
    return {
      backgroundColor: `hsla(${hue}, 80%, 45%, 0.07)`,
      color: `hsl(${hue}, 80%, 40%)`,
      borderColor: `hsla(${hue}, 80%, 45%, 0.15)`,
      borderWidth: '1px',
      borderStyle: 'solid'
    };
  }
};

export default function TaskItem({
  task,
  selectedDate,
  isToday,
  isPast,
  handleToggleComplete,
  handlePostponeTask,
  handleDeleteTask,
  formatDateDisplay,
  theme
}) {
  const isPostponedOnThisDay = task.wasShifted && task.shiftedFromDate === selectedDate;
  const isCompletedOnThisDay = task.isCompleted && task.dateCompleted === selectedDate;
  const isMissedOnThisDay = isPast && !task.isCompleted && task.activeDate === selectedDate;

  let itemClass = '';
  if (isCompletedOnThisDay) itemClass = 'completed';
  else if (isPostponedOnThisDay) itemClass = 'postponed';
  else if (isMissedOnThisDay) itemClass = 'missed';

  const taskEmoji = getTaskEmoji(task.text, task.category);
  const badgeStyle = getBadgeStyle(task.category, theme);

  // Checkbox active condition: you can only tick a task on its scheduled date when it is TODAY.
  // Wait! The user says: "its just that i can tick on that task on that particular day only"
  // So you can tick a task if selectedDate === todayStr AND the task is active today.
  // Meaning you can tick if isToday is true, and the task is scheduled for today (task.activeDate === selectedDate).
  const canCheckboxClick = isToday && (task.activeDate === selectedDate) && !isPostponedOnThisDay;

  return (
    <li className={`task-item-card ${itemClass} ${!canCheckboxClick ? 'readonly' : ''}`}>
      <div className="task-card-left">
        {/* Custom Square Checkbox */}
        <label className="square-checkbox-wrapper">
          <input
            type="checkbox"
            className="square-checkbox-input"
            checked={isCompletedOnThisDay}
            disabled={!canCheckboxClick}
            onChange={() => handleToggleComplete(task.id)}
          />
          <span className="square-checkbox-box">
            <Check size={12} strokeWidth={3} />
          </span>
        </label>

        {/* Task Content */}
        <div className="task-txt-group">
          <span className="task-txt">
            <span>{taskEmoji}</span>
            <span>{task.text}</span>
          </span>

          {/* Badges and Metadata */}
          <div className="task-meta-row">
            <span className="cat-badge" style={badgeStyle}>
              {task.category}
            </span>

            {isPostponedOnThisDay && (
              <span className="postponed-tag">
                <ArrowRight size={11} />
                Postponed to {formatDateDisplay(task.activeDate)}
              </span>
            )}

            {task.wasShifted && task.activeDate === selectedDate && (
              <span className="carried-over-tag">
                Pushed from {formatDateDisplay(task.shiftedFromDate)}
              </span>
            )}

            {isMissedOnThisDay && (
              <span className="missed-tag">
                Incomplete / Missed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (Only allowed if selectedDate is TODAY, and only if not postponed) */}
      {isToday && !isPostponedOnThisDay && (
        <div className="item-actions">
          {!isCompletedOnThisDay && (
            <button
              className="action-trigger postpone"
              onClick={() => handlePostponeTask(task.id)}
              title="Postpone to Tomorrow"
            >
              <ArrowRight size={15} />
            </button>
          )}

          <button
            className="action-trigger delete"
            onClick={() => handleDeleteTask(task.id)}
            title="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </li>
  );
}
