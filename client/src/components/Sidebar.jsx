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
          to="/projects" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <FolderOpen size={20} />
          <span>Projects</span>
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
      
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <Sun size={20} />
          <span>Settings</span>
        </NavLink>
        
        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          &copy; {new Date().getFullYear()} Priyank K Rajpopat.<br/>All Rights Reserved.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
