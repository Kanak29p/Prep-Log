import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TaskItem from './TaskItem';

export default function TaskAccordions({
  tasks,
  selectedDate,
  isToday,
  isPast,
  handleToggleComplete,
  handlePostponeTask,
  handleDeleteTask,
  formatDateDisplay
}) {
  // Collapsible panels state
  const [openGroups, setOpenGroups] = useState({
    DSA: true,
    'Placement Cell': true,
    Personal: true
  });

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const categories = [
    { name: 'DSA', emoji: '💻' },
    { name: 'Placement Cell', emoji: '💼' },
    { name: 'Personal', emoji: '👤' }
  ];

  return (
    <div className="accordions-container">
      {categories.map((category) => {
        const catTasks = tasks.filter(t => t.category === category.name);
        const isOpen = openGroups[category.name];
        
        return (
          <div key={category.name} className="accordion-group">
            <button 
              className="accordion-header"
              onClick={() => toggleGroup(category.name)}
            >
              <div className="accordion-header-left">
                <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>
                  <ChevronDown size={18} />
                </span>
                <span>{category.emoji} {category.name}</span>
              </div>
              <span className="accordion-count">{catTasks.length}</span>
            </button>

            <div className={`accordion-content ${isOpen ? 'open' : 'closed'}`}>
              {catTasks.length === 0 ? (
                <div className="no-tasks-placeholder">
                  No tasks under this category for this view.
                </div>
              ) : (
                <ul className="task-list">
                  {catTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      selectedDate={selectedDate}
                      isToday={isToday}
                      isPast={isPast}
                      handleToggleComplete={handleToggleComplete}
                      handlePostponeTask={handlePostponeTask}
                      handleDeleteTask={handleDeleteTask}
                      formatDateDisplay={formatDateDisplay}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
