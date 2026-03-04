import React, { useState } from 'react';
import './AdminLayout.css';

const navItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: '🏠' },
  { id: 'pending', label: 'Pending Approvals', icon: '⏳' },
  { id: 'users', label: 'All Users', icon: '👥' },
  { id: 'appeals', label: 'User Appeals', icon: '✉️' },
  { id: 'add-recycler', label: 'Add Recycler', icon: '➕' },
  { id: 'edit-recycler', label: 'Edit Recycler', icon: '✏️' },
  { id: 'reports', label: 'System Reports', icon: '📊' },
  { id: 'requests', label: 'Pickup Requests', icon: '📦' },
];

export default function AdminLayout({ children, activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <span className="sidebar-brand">🗂</span>
            {!collapsed && <h5 className="mb-0 sidebar-title">Admin</h5>}
          </div>
          <button 
            className="btn btn-sm btn-outline-secondary sidebar-toggle" 
            onClick={() => setCollapsed((c) => !c)} 
            aria-label="Toggle sidebar"
          >
            {collapsed ? '☰' : '✕'}
          </button>
        </div>
        <nav className="nav flex-column">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link btn btn-ghost w-100 ${isActive ? 'active' : ''}`}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-grow-1 admin-main">
        {children}
      </main>
    </div>
  );
}

