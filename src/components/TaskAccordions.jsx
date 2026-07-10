import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, PlusCircle, X } from 'lucide-react';
import TaskItem from './TaskItem';

const getCategoryEmoji = (catName) => {
  if (catName === 'DSA') return '💻';
  if (catName === 'Placement Cell') return '💼';
  if (catName === 'Personal') return '👤';
  return '🏷️';
};

export default function TaskAccordions({
  tasks,
  categories,
  handleAddCategory,
  selectedDate,
  todayStr,
  isToday,
  isPast,
  handleToggleComplete,
  handlePostponeTask,
  handleDeleteTask,
  formatDateDisplay,
  theme,
  openAddTaskModal
}) {
  // Collapsible panels state
  const [openGroups, setOpenGroups] = useState({});
  
  // Inline Add Category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Initialize all categories as expanded by default
  useEffect(() => {
    const nextOpen = {};
    categories.forEach(cat => {
      if (openGroups[cat] === undefined) {
        nextOpen[cat] = true;
      } else {
        nextOpen[cat] = openGroups[cat];
      }
    });
    setOpenGroups(nextOpen);
  }, [categories]);

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    handleAddCategory(newCatName.trim());
    setNewCatName('');
    setIsAddingCategory(false);
  };

  // Show the add task triggers only for current or future dates
  const canAddTask = selectedDate >= todayStr;

  return (
    <div className="accordions-container">
      {categories.map((catName) => {
        const catTasks = tasks.filter(t => t.category === catName);
        const isOpen = !!openGroups[catName];
        const emoji = getCategoryEmoji(catName);
        
        return (
          <div key={catName} className="accordion-group">
            <div 
              className="accordion-header"
              onClick={() => toggleGroup(catName)}
            >
              <div className="accordion-header-left">
                <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>
                  <ChevronDown size={18} />
                </span>
                <span>{emoji} {catName}</span>
              </div>
              
              <div className="accordion-header-right">
                <span className="accordion-count">{catTasks.length}</span>
                {canAddTask && (
                  <button
                    className="accordion-add-btn"
                    title={`Add task under ${catName}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle collapse
                      openAddTaskModal(catName);
                    }}
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>

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
                      theme={theme}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      {/* Dynamic "+ Add Category" button & form (Available on current and future dates) */}
      {canAddTask && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!isAddingCategory ? (
            <button 
              className="add-category-trigger"
              onClick={() => setIsAddingCategory(true)}
            >
              <PlusCircle size={16} />
              <span>Add Custom Category</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCategorySubmit} className="add-category-form">
              <input
                type="text"
                className="add-category-input"
                placeholder="e.g. Aptitude Prep, System Design"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="btn-cat-add">Add</button>
              <button 
                type="button" 
                className="btn-cat-cancel"
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
