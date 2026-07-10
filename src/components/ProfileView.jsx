import React from 'react';

export default function ProfileView({ tasks }) {
  const dsaCount = tasks.filter(t => t.category === 'DSA' && t.isCompleted).length;
  const placementCount = tasks.filter(t => t.category === 'Placement Cell' && t.isCompleted).length;

  return (
    <div className="profile-layout animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, margin: '0.2rem 0' }}>
        Placement Profile
      </h2>

      {/* Profile Header Details */}
      <div className="card-panel profile-card">
        <div className="profile-avatar">KU</div>
        <div className="profile-info">
          <h3 className="profile-name">Kanak User</h3>
          <span className="profile-tag">Computer Science & Engineering</span>
          <span className="profile-tag" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Batch of 2027</span>
        </div>
      </div>

      {/* Target Details */}
      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          Career Target & Milestones
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Target Role:</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Frontend UI/UX Engineer</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Target Companies:</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Google, Stripe, Linear</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Placement CGPA:</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>9.2 / 10</span>
          </div>
        </div>
      </div>

      {/* Placement Preparation Checklist */}
      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          Placement Cell Checklist
        </h3>

        <div className="checklist-group">
          <div className="checklist-row">
            <span className="checklist-bullet">✓</span>
            <span>Resume verified & approved by Placement Cell</span>
          </div>
          <div className="checklist-row">
            <span className="checklist-bullet">✓</span>
            <span>Completed <strong>{dsaCount}</strong> DSA preparation milestones</span>
          </div>
          <div className="checklist-row">
            <span className="checklist-bullet">✓</span>
            <span>Completed <strong>{placementCount}</strong> placement cell coordination briefs</span>
          </div>
          <div className="checklist-row">
            <span className="checklist-bullet">✓</span>
            <span>LinkedIn profile and portfolio website deployed</span>
          </div>
          <div className="checklist-row">
            <span className="checklist-bullet" style={{ color: 'var(--text-muted)' }}>○</span>
            <span style={{ color: 'var(--text-muted)' }}>Mock Technical Panel Interview (Scheduled for next week)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
