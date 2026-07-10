import React from 'react';
import { Home, BarChart2, User, Plus } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, setIsModalOpen, isToday }) {
  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-content">
        <button
          className={`bottom-nav-item ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentTab('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        {/* Floating Action Button for Adding Task (Active on Today only) */}
        {isToday ? (
          <button
            className="fab-button"
            onClick={() => setIsModalOpen(true)}
            title="Create New Task"
          >
            <Plus size={24} />
          </button>
        ) : (
          <div style={{ width: '52px', height: '0px' }}></div> // Spacer when plus button is hidden
        )}

        <button
          className={`bottom-nav-item ${currentTab === 'insights' ? 'active' : ''}`}
          onClick={() => setCurrentTab('insights')}
        >
          <BarChart2 size={20} />
          <span>Insights</span>
        </button>

        <button
          className={`bottom-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}
