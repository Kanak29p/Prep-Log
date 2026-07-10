import React from 'react';
import { Home, BarChart2, User } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab }) {
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
