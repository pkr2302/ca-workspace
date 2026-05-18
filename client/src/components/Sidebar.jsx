import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, FolderOpen, Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>CA Workspace</h1>
      </div>
      <nav className="nav-links" style={{ flex: 1 }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/clients" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Users size={20} />
          <span>Clients</span>
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <CalendarDays size={20} />
          <span>Tasks & Calendar</span>
        </NavLink>
        <NavLink 
          to="/files" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <FolderOpen size={20} />
          <span>File Explorer</span>
        </NavLink>
      </nav>
      
      {/* Theme Toggle Button */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1rem',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
