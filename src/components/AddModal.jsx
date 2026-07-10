import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

const getCategoryIcon = (catName) => {
  if (catName === 'DSA') return '💻';
  if (catName === 'Placement Cell') return '💼';
  if (catName === 'Personal') return '👤';
  return '🏷️';
};

export default function AddModal({ isOpen, onClose, handleAddTask, categories, defaultCategory }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('DSA');
  const inputRef = useRef(null);

  // Set the default category and focus input on open
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory || (categories[0] || 'DSA'));
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultCategory, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleAddTask(text.trim(), category);
    setText('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header-row">
          <h3 className="modal-title">Create New Task</h3>
          <button className="icon-btn" onClick={onClose} title="Close Modal" style={{ border: 'none', background: 'none', boxShadow: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input
            ref={inputRef}
            type="text"
            className="modal-text-input"
            placeholder="e.g. Solve 3 Leetcode BFS problems"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <div className="modal-cat-row">
            <span className="modal-cat-label">Select Category</span>
            <div className="modal-cat-pills">
              {categories.map((catName) => {
                const isActive = category === catName;
                const icon = getCategoryIcon(catName);
                return (
                  <button
                    key={catName}
                    type="button"
                    className={`modal-cat-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setCategory(catName)}
                  >
                    <span>{icon}</span>
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-base btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-base btn-modal-add">
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
