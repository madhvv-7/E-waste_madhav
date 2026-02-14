import React, { useState } from 'react';
import './AdminLayout.css';

const navItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: '🏠' },
  { id: 'pending', label: 'Pending Approvals', icon: '⏳' },
  { id: 'users', label: 'All Users', icon: '👥' },
  { id: 'appeals', label: 'User Appeals', icon: '✉️' },
  { id: 'add-recycler', label: 'Add Recycler', icon: '➕' },
  { id: 'reports', label: 'System Reports', icon: '📊' },
  { id: 'requests', label: 'Pickup Requests', icon: '📦' },
];

export default function AdminLayout({ children, activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex admin-layout" style={{ minHeight: '80vh' }}>
      <aside className={`admin-sidebar bg-light border-end ${collapsed ? 'collapsed' : ''}`}>
        <div className="d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center gap-2">
            <div className="sidebar-brand" aria-hidden>
              🗂
            </div>
            <h5 className="mb-0 sidebar-title">{!collapsed && 'Admin'}</h5>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
            {collapsed ? '☰' : '✕'}
          </button>
        </div>
        <nav className="nav flex-column px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link btn btn-ghost d-flex align-items-center w-100 mb-1 ${isActive ? 'active' : ''}`}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon" style={{ width: 28, textAlign: 'center' }}>{item.icon}</span>
                <span className="nav-label ms-2">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-grow-1 p-4 admin-main">
        {children}
      </main>
    </div>
  );
}

