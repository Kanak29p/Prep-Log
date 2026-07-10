import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

export default function AddModal({ isOpen, onClose, handleAddTask }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('DSA');
  const inputRef = useRef(null);

  // Focus input automatically on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleAddTask(text.trim(), category);
    setText('');
    setCategory('DSA');
    onClose();
  };

  const categories = [
    { name: 'DSA', icon: '💻' },
    { name: 'Placement Cell', icon: '💼' },
    { name: 'Personal', icon: '👤' }
  ];

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
              {categories.map((cat) => {
                const isActive = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`modal-cat-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setCategory(cat.name)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
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
